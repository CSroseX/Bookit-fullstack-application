import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, XCircle, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("bookingId");
  const status = urlParams.get("status");
  const errorMessage = urlParams.get("message");

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      return bookings[0];
    },
    enabled: !!bookingId && status === "success",
  });

  const { data: experience } = useQuery({
    queryKey: ['experience', booking?.experience_id],
    queryFn: async () => {
      const experiences = await base44.entities.Experience.filter({ id: booking.experience_id });
      return experiences[0];
    },
    enabled: !!booking?.experience_id,
  });

  const { data: slot } = useQuery({
    queryKey: ['slot', booking?.slot_id],
    queryFn: async () => {
      const slots = await base44.entities.Slot.filter({ id: booking.slot_id });
      return slots[0];
    },
    enabled: !!booking?.slot_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD166]" />
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <Card className="max-w-2xl w-full p-8 md:p-12 border-[#E5E7EB] text-center">
        {/* Success/Error Icon */}
        <div className="mb-6">
          {isSuccess ? (
            <div className="w-20 h-20 mx-auto bg-[#10B981]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-[#10B981]" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-[#EF4444]/10 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-[#EF4444]" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isSuccess ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
          {isSuccess ? "Booking Confirmed!" : "Booking Failed"}
        </h1>

        {/* Message */}
        <p className="text-[#6B7280] text-lg mb-8">
          {isSuccess 
            ? "Your experience has been successfully booked. We've sent a confirmation email with all the details."
            : errorMessage || "Something went wrong while processing your booking. Please try again or contact support."}
        </p>

        {/* Booking Details (Success Only) */}
        {isSuccess && booking && experience && slot && (
          <div className="bg-[#FAFAFA] rounded-xl p-6 mb-8 text-left">
            <h3 className="text-xl font-semibold text-[#222222] mb-4">Booking Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Booking ID</span>
                <span className="font-semibold text-[#222222]">{booking.id.slice(0, 8).toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Name</span>
                <span className="font-medium text-[#222222]">{booking.customer_name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Email</span>
                <span className="font-medium text-[#222222]">{booking.customer_email}</span>
              </div>

              <div className="border-t border-[#E5E7EB] my-3"></div>
              
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Experience</span>
                <span className="font-medium text-[#222222]">{experience.title}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Date</span>
                <span className="font-medium text-[#222222]">
                  {format(new Date(slot.date), "MMMM dd, yyyy")}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Time</span>
                <span className="font-medium text-[#222222]">{slot.time}</span>
              </div>

              <div className="border-t border-[#E5E7EB] my-3"></div>
              
              {booking.discount_amount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Base Price</span>
                    <span className="font-medium text-[#222222]">₹{booking.base_amount}</span>
                  </div>
                  <div className="flex justify-between text-[#10B981]">
                    <span>Discount</span>
                    <span className="font-medium">-₹{booking.discount_amount}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-[#222222]">Total Paid</span>
                <span className="font-bold text-[#222222]">₹{booking.total_amount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(createPageUrl("Home"))}
            className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold px-8 py-6 text-base rounded-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          
          {!isSuccess && (
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-[#E5E7EB] px-8 py-6 text-base rounded-xl"
            >
              Try Again
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}