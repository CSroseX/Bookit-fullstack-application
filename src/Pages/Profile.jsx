import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['userBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ customer_email: user.email }, '-created_date'),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['userReviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user?.email,
    initialData: [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsEditing(false);
    },
  });

  const handleEditToggle = () => {
    if (!isEditing) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
        date_of_birth: user.date_of_birth || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (loadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD166]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[#6B7280] mb-4">Please log in to view your profile</p>
        <Button onClick={() => base44.auth.redirectToLogin()} className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222]">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <Card className="mb-8 border-[#E5E7EB]">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-[#FFD166]">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-[#FFD166] text-[#222222] text-2xl font-bold">
                  {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-3xl font-bold text-[#222222] mb-2">
                  {user.full_name || "Traveler"}
                </h1>
                <div className="flex items-center gap-2 text-[#6B7280] mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleEditToggle}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "" : "bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold"}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Details */}
        <div className="lg:col-span-1">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-xl">Profile Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="border-[#E5E7EB]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border-[#E5E7EB]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="border-[#E5E7EB]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="border-[#E5E7EB]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="border-[#E5E7EB] h-24"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="w-full bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  {user.phone && (
                    <div className="flex items-center gap-3 text-[#6B7280]">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  
                  {user.date_of_birth && (
                    <div className="flex items-center gap-3 text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(user.date_of_birth), "MMMM d, yyyy")}</span>
                    </div>
                  )}

                  {user.bio && (
                    <div className="pt-4 border-t border-[#E5E7EB]">
                      <p className="text-sm text-[#6B7280]">{user.bio}</p>
                    </div>
                  )}

                  {!user.phone && !user.date_of_birth && !user.bio && (
                    <p className="text-sm text-[#6B7280] italic">
                      Complete your profile to help us personalize your experience
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6 border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-xl">Activity Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">Total Bookings</span>
                <Badge className="bg-[#FFD166] text-[#222222] text-lg px-3 py-1">
                  {bookings.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">Reviews Written</span>
                <Badge className="bg-[#10B981] text-white text-lg px-3 py-1">
                  {reviews.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bookings & Reviews */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#E5E7EB]">
              <TabsTrigger value="bookings">My Bookings ({bookings.length})</TabsTrigger>
              <TabsTrigger value="reviews">My Reviews ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="mt-6">
              {loadingBookings ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD166]" />
                </div>
              ) : bookings.length === 0 ? (
                <Card className="p-12 text-center border-[#E5E7EB]">
                  <Calendar className="w-16 h-16 mx-auto text-[#6B7280] opacity-30 mb-4" />
                  <h3 className="text-xl font-semibold text-[#222222] mb-2">No bookings yet</h3>
                  <p className="text-[#6B7280] mb-6">Start exploring amazing experiences!</p>
                  <Button className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222]">
                    Browse Experiences
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="border-[#E5E7EB] hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[#222222] mb-1">
                              Booking #{booking.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-[#6B7280]">
                              Booked on {format(new Date(booking.created_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <Badge className={`${
                            booking.status === 'confirmed' 
                              ? 'bg-[#10B981] text-white' 
                              : 'bg-[#6B7280] text-white'
                          }`}>
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-[#6B7280]">Customer:</span>
                            <span className="ml-2 font-medium text-[#222222]">{booking.customer_name}</span>
                          </div>
                          <div>
                            <span className="text-[#6B7280]">Total Amount:</span>
                            <span className="ml-2 font-bold text-[#222222]">₹{booking.total_amount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {loadingReviews ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD166]" />
                </div>
              ) : reviews.length === 0 ? (
                <Card className="p-12 text-center border-[#E5E7EB]">
                  <User className="w-16 h-16 mx-auto text-[#6B7280] opacity-30 mb-4" />
                  <h3 className="text-xl font-semibold text-[#222222] mb-2">No reviews yet</h3>
                  <p className="text-[#6B7280]">Share your experiences with the community!</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="border-[#E5E7EB]">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= review.rating ? "text-[#FFD166] fill-current" : "text-[#E5E7EB] fill-current"
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-[#6B7280]">
                            {format(new Date(review.created_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        
                        {review.comment && (
                          <p className="text-[#6B7280] text-sm leading-relaxed">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}