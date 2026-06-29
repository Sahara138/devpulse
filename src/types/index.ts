export const USER_ROLE = {
  CONTRIBUTOR: "contributor",
  MAINTAINER: "maintainer",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];