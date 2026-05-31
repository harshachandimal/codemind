export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponseData = {
  user: AuthUser;
  token: string;
};

export type CurrentUserResponseData = {
  user: AuthUser;
};
