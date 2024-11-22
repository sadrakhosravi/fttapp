import * as React from 'react';

// Components
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export const Preview = () => {
  return (
    <Card className="flex h-full w-full flex-col rounded-2xl rounded-b-none border-input/80">
      <CardContent className="h-full p-4 pt-4">
        <Tabs defaultValue="account" className="w-full">
          <TabsList>
            <TabsTrigger className="font-semibold" value="page-view">
              Page View
            </TabsTrigger>
            <TabsTrigger
              className="cursor-not-allowed font-semibold disabled:cursor-not-allowed"
              value=""
              title="This section is comming soon"
              disabled
            >
              3D View
            </TabsTrigger>
          </TabsList>
          <TabsContent value="page-view">Page View</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
