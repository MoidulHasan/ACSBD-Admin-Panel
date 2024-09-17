export const getSeverity = (
  status: "public" | "private" | "hidden" | true | false,
) => {
  switch (status) {
    case "public":
      return "success";

    case "private":
      return "info";

    case "hidden":
      return "info";

    case true:
      return "success";

    case false:
      return "info";
  }
};
