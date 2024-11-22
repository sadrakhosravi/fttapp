import * as React from 'react';

// Components
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Preview = () => {
  return (
    <Card className="flex h-full w-full flex-col rounded-2xl rounded-b-none border-input/80">
      <CardContent className="h-full p-4 pt-4">
        <Tabs defaultValue="page" className="w-full">
          <TabsList>
            <TabsTrigger className="font-semibold" value="page">
              Page View
            </TabsTrigger>
          </TabsList>
          <TabsContent className="p-4" value="page">
            Page View
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
