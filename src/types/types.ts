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

interface SearchPaginationParams {
  page: number;
  limit: number;
  skip: number;
}
interface Items {
  id?: any;
  name: string;
  quantity: string;
  approxAmount: number;
}
// modify the code such that all value will be string
enum DonationCategory {
  SCHOOL_HOSTEL_OPERATIONS = "Donation for operational activities of school and hostel",
  LIFETIME_MEMBERSHIP = "Donation for Life time membership",
  LIFETIME_LUNCH = "Donation for Life time lunch",
  IN_KIND = "Donation in-kind",
  LAND_AND_BUILDING = "Donation for Land and building",
  FEES = "Fees",
  MEMORIAL_DAY = "Memorial day",
  BIRTHDAY_CELEBRATION = "Birthday celebration",
  OTHER = "OTHER",
}

enum PaymentMethod {
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  UPI = "UPI",
  DD = "DD",
}

export {
  returnUserdata,
  JwtPayload,
  DonationCategory,
  PaymentMethod,
  SearchPaginationParams,
  Items,
};
