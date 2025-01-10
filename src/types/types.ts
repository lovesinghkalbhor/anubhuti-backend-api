type returnUserdata = {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  adhar_card: string | null;
  refreshToken: string;
  accessToken: string;
};

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export { returnUserdata, JwtPayload };
