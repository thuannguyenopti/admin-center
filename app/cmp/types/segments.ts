export type RealTimeSegment = {
  id: string;
  name: string;
  description: string;
};

export const REAL_TIME_SEGMENTS: RealTimeSegment[] = [
  { id: "everyone", name: "Everyone", description: "No targeting applied" },
  { id: "new-visitors", name: "New Visitors", description: "First-time site visitors" },
  { id: "returning-customers", name: "Returning Customers", description: "Users with previous purchases" },
  { id: "high-intent", name: "High Intent", description: "Users showing purchase signals" },
  { id: "engaged-subscribers", name: "Engaged Subscribers", description: "Active email subscribers" },
  { id: "cart-abandoners", name: "Cart Abandoners", description: "Users who added items but didn't purchase" },
  { id: "vip-customers", name: "VIP Customers", description: "Top 10% spenders" },
];
