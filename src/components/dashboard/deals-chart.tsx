"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { dealsByStage } from '@/lib/data';
import { ChartTooltipContent } from '@/components/ui/chart';

export function DealsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deals by Stage</CardTitle>
        <CardDescription>A snapshot of your current sales pipeline.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dealsByStage}>
            <XAxis
              dataKey="stage"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
             />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
