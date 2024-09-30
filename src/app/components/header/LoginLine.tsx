import liff from "@line/liff";

export const login = async (): Promise<boolean> => {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) {
        throw new Error("LINE_LIFF_ID is not defined.");
      }
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) {
        liff.login();
        return false;
      } else {
        const userProfile = await liff.getProfile();
        if (userProfile) {
          
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.error("LIFF initialization or profile retrieval failed:", error);
      return false;
    }
  };