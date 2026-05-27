import { VAUS } from "@/app/opal/data/vaus";

const VAU_PREFIX = "vau-";

// Deterministic mapping for seeded human users → PNGs in /public/avatars.
const HUMAN_AVATAR_MAP: Record<string, string> = {
  pei: "/avatars/avatar-1.png",
  frank: "/avatars/avatar-4.png",
  jamie: "/avatars/avatar-3.png",
  "mary-anne": "/avatars/avatar-2.png",
  "opal-bot": "/opal-orb.png",
};

export function avatarFor(userId: string): string | undefined {
  if (userId.startsWith(VAU_PREFIX)) {
    const vauId = userId.slice(VAU_PREFIX.length);
    return VAUS.find((v) => v.id === vauId)?.avatar;
  }
  return HUMAN_AVATAR_MAP[userId];
}
