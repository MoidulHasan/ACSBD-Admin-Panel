export const getSeverity = (status: "public" | "private" | "hidden") => {
  switch (status) {
    case "public":
      return "success";

    case "private":
      return "info";

    case "hidden":
      return "info";
  }
};
