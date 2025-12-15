import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

admin.initializeApp();

const db = admin.firestore();
const secrets = functions.config().google;
const ORG_ID = 'groupmkl';
const ADMIN_EMAIL = 'info@groupmkl.com';
const ALLOWED_DOMAIN = '@groupmkl.com';

/**
 * Callable function to ensure organization and membership exist for a user.
 * This is the primary entry point for setting up a new user.
 */
export const ensureOrgMembership = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.email) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const userEmail = context.auth.token.email;
    const uid = context.auth.uid;

    // Enforce email domain restriction
    if (!userEmail.endsWith(ALLOWED_DOMAIN)) {
        throw new functions.https.HttpsError('permission-denied', 'Access denied. Invalid email domain.', { invalidDomain: true });
    }

    const orgRef = db.collection('orgs').doc(ORG_ID);
    const memberRef = orgRef.collection('members').doc(uid);

    return db.runTransaction(async (transaction) => {
        const orgDoc = await transaction.get(orgRef);
        const memberDoc = await transaction.get(memberRef);

        // 1. Create the Organization if it doesn't exist
        if (!orgDoc.exists) {
            transaction.set(orgRef, {
                name: 'Synergize CRM',
                ownerEmail: ADMIN_EMAIL,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }

        // 2. Create the Membership if it doesn't exist
        if (!memberDoc.exists) {
            const role = userEmail === ADMIN_EMAIL ? 'owner' : 'member';
            transaction.set(memberRef, {
                email: userEmail,
                role: role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return { success: true, message: `Membership created with role: ${role}.` };
        }
        
        return { success: true, message: 'Membership already exists.' };
    });
});


/**
 * Creates an OAuth2 client with the given credentials.
 */
function getOAuth2Client() {
    return new google.auth.OAuth2(
        secrets.client_id,
        secrets.client_secret,
        secrets.redirect_uri 
    );
}

/**
 * Retrieves the authenticated Google API client for a given organization.
 * It uses the stored refresh token to get a new access token.
 */
async function getGoogleAuthClient(orgId: string) {
    const integrationDoc = await db.doc(`orgs/${orgId}/integrations/google`).get();
    const integrationData = integrationDoc.data();

    if (!integrationData || !integrationData.refreshToken) {
        throw new functions.https.HttpsError('failed-precondition', 'Google integration not found or refresh token is missing.');
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: integrationData.refreshToken });

    try {
        const { token } = await oauth2Client.getAccessToken();
        oauth2Client.setCredentials({ access_token: token });
        return oauth2Client;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        await db.doc(`orgs/${orgId}/integrations/google`).update({
            connected: false,
            lastError: 'Failed to refresh token. Please reconnect.',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        throw new functions.https.HttpsError('unauthenticated', 'Failed to refresh access token.');
    }
}

/**
 * Callable function to sync Google Calendar events.
 */
export const syncGoogleCalendarEvents = functions.https.onCall(async (data, context) => {
    const { orgId } = data;
    if (!context.auth || !orgId) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    try {
        const auth = await getGoogleAuthClient(orgId);
        const calendar = google.calendar({ version: 'v3', auth });

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            timeMax: thirtyDaysFromNow.toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items;
        if (!events || events.length === 0) {
            console.log('No upcoming events found.');
            return { success: true, message: 'No upcoming events found.' };
        }

        const batch = db.batch();
        events.forEach(event => {
            const eventRef = db.collection(`orgs/${orgId}/calendarEvents`).doc(event.id!);
            batch.set(eventRef, {
                googleEventId: event.id,
                summary: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                attendees: event.attendees?.map(a => a.email).filter(e => e) || [],
                htmlLink: event.htmlLink,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                orgId: orgId
            }, { merge: true });
        });

        await batch.commit();

        await db.doc(`orgs/${orgId}/integrations/google`).update({
            lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        return { success: true, message: `${events.length} events synced.` };
    } catch (error) {
        console.error('Error syncing Google Calendar:', error);
        throw new functions.https.HttpsError('internal', 'Failed to sync Google Calendar events.');
    }
});


/**
 * Callable function to sync Gmail messages.
 */
export const syncGmailMessages = functions.https.onCall(async (data, context) => {
    const { orgId } = data;
    if (!context.auth || !orgId) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
  
    try {
      const auth = await getGoogleAuthClient(orgId);
      const gmail = google.gmail({ version: 'v1', auth });
  
      const response = await gmail.users.messages.list({ userId: 'me', maxResults: 50 });
      const messages = response.data.messages;
  
      if (!messages || messages.length === 0) {
        return { success: true, message: 'No messages found.' };
      }
  
      const batch = db.batch();
      for (const messageHeader of messages) {
        const msg = await gmail.users.messages.get({ userId: 'me', id: messageHeader.id! });
        const { id, threadId, snippet, payload } = msg.data;
        const headers = payload?.headers || [];
  
        const getHeader = (name: string) => headers.find(h => h.name === name)?.value || '';
        
        const emailData = {
          googleMessageId: id,
          threadId: threadId,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          to: getHeader('To'),
          date: getHeader('Date'),
          snippet: snippet,
          orgId: orgId
        };
  
        const emailRef = db.collection(`orgs/${orgId}/emails`).doc(id!);
        batch.set(emailRef, emailData, { merge: true });
      }
  
      await batch.commit();
      
      await db.doc(`orgs/${orgId}/integrations/google`).update({
        lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      return { success: true, message: `${messages.length} emails synced.` };
    } catch (error) {
      console.error('Error syncing Gmail:', error);
      throw new functions.https.HttpsError('internal', 'Failed to sync Gmail messages.');
    }
});

/**
 * Callable function to sync Google Tasks.
 */
export const syncGoogleTasks = functions.https.onCall(async (data, context) => {
    const { orgId } = data;
    if (!context.auth || !orgId) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    try {
        const auth = await getGoogleAuthClient(orgId);
        const tasksApi = google.tasks({ version: 'v1', auth });

        const taskListsResponse = await tasksApi.tasklists.list();
        const taskLists = taskListsResponse.data.items;

        if (!taskLists || taskLists.length === 0) {
            return { success: true, message: 'No task lists found.' };
        }

        const batch = db.batch();
        let totalTasksSynced = 0;

        for (const taskList of taskLists) {
            const tasksResponse = await tasksApi.tasks.list({ tasklist: taskList.id! });
            const tasks = tasksResponse.data.items;

            if (tasks) {
                tasks.forEach(task => {
                    const taskRef = db.collection(`orgs/${orgId}/tasks`).doc(task.id!);
                    batch.set(taskRef, {
                        googleTaskId: task.id,
                        taskListId: taskList.id,
                        title: task.title,
                        notes: task.notes,
                        due: task.due,
                        status: task.status, // 'needsAction' or 'completed'
                        completedAt: task.completed,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        orgId: orgId,
                    }, { merge: true });
                    totalTasksSynced++;
                });
            }
        }

        await batch.commit();

        await db.doc(`orgs/${orgId}/integrations/google`).update({
            lastSyncAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        return { success: true, message: `${totalTasksSynced} tasks synced.` };
    } catch (error) {
        console.error('Error syncing Google Tasks:', error);
        throw new functions.https.HttpsError('internal', 'Failed to sync Google Tasks.');
    }
});
