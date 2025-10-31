// Mock API client for base44 - replace with actual implementation
export const base44 = {
  auth: {
    me: async () => {
      // Mock user data
      return {
        id: 1,
        email: "user@example.com",
        full_name: "John Doe",
        avatar: null
      };
    },
    logout: () => {
      // Mock logout
      console.log("Logged out");
    },
    redirectToLogin: () => {
      // Mock redirect
      console.log("Redirecting to login");
    }
  },
  entities: {
    Experience: {
      list: async (ordering = '') => {
        // Mock experiences data
        return [
          {
            id: 1,
            title: "Desert Safari Adventure",
            description: "Experience the thrill of the desert with our guided safari tour. Ride camels, enjoy traditional music, and witness stunning sunsets.",
            location: "Rajasthan",
            price: 2500,
            image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop",
            created_date: "2024-01-01"
          },
          {
            id: 2,
            title: "Mountain Trekking Expedition",
            description: "Conquer the peaks of the Himalayas with our expert guides. Experience breathtaking views and local culture.",
            location: "Himachal Pradesh",
            price: 3500,
            image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop",
            created_date: "2024-01-02"
          },
          {
            id: 3,
            title: "Beach Yoga Retreat",
            description: "Find inner peace with our beachside yoga retreat. Daily sessions, meditation, and healthy meals included.",
            location: "Goa",
            price: 4200,
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            created_date: "2024-01-03"
          }
        ];
      }
    },
    Review: {
      list: async () => {
        // Mock reviews data
        return [
          { id: 1, experience_id: 1, rating: 5, comment: "Amazing experience!", user_id: 1 },
          { id: 2, experience_id: 1, rating: 4, comment: "Great tour!", user_id: 2 },
          { id: 3, experience_id: 2, rating: 5, comment: "Life-changing!", user_id: 3 },
          { id: 4, experience_id: 3, rating: 4, comment: "Very relaxing", user_id: 4 }
        ];
      }
    }
  }
};
