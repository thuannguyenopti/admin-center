import { AudienceType } from "./enums";

export interface Audience {
  id: string;
  name: string;
  description: string;
  type: AudienceType; 
}

export const mockAudiences: Audience[] = [
  {
    id: "1",
    name: "Endurance Cyclists – Long Ride Training",
    description: "Visitors focused on long-distance cycling who are interested in endurance training, pacing strategies, and nutrition for extended rides.",
    type: "Long Ride Training",
  },
  {
    id: "2",
    name: "Performance Cyclists – Speed & Power",
    description: "Visitors interested in improving cycling performance through speed, power output, intervals, and advanced training techniques.",
    type: "Speed & Power",
  },
  {
    id: "3",
    name: "Casual & Recreational Cyclists",
    description: "Visitors who cycle for enjoyment, fitness, or commuting rather than structured performance or competition.",
    type: "Recreational",
  },
  {
    id: "4",
    name: "Recovery & Cross-Training Cyclists",
    description: "Visitors interested in recovery, injury prevention, and complementary training to support their cycling routine.",
    type: "Recovery",
  },
];