export function createPageUrl(pageName) {
  // Simple mapping for now - can be expanded later
  const pageMap = {
    Home: "/",
    ExperienceDetails: "/experience",
    Checkout: "/checkout",
    BookingConfirmation: "/booking-confirmation",
    Profile: "/profile"
  };

  return pageMap[pageName] || "/";
}
