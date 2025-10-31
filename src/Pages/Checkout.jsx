import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function Checkout() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const experienceId = urlParams.get("experienceId");
  const slotId = urlParams.get("slotId");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    promoCode: ""
  });
  const [errors, setErrors] = useState({});
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const { data: experience } = useQuery({
    queryKey: ['experience', experienceId],
    queryFn: async () => {
      const experiences = await base44.entities.Experience.filter({ id: experienceId });
      return experiences[0];
    },
    enabled: !!experienceId,
  });

  const { data: slot } = useQuery({
    queryKey: ['slot', slotId],
    queryFn: async () => {
      const slots = await base44.entities.Slot.filter({ id: slotId });
      return slots[0];
    },
    enabled: !!slotId,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      // Check if slot is still available
      const currentSlot = await base44.entities.Slot.filter({ id: slotId });
      if (!currentSlot[0]?.available) {
        throw new Error("This slot is no longer available");
      }

      // Create booking
      const booking = await base44.entities.Booking.create(bookingData);

      // Mark slot as unavailable
      await base44.entities.Slot.update(slotId, { available: false });

      return booking;
    },
    onSuccess: (booking) => {
      navigate(createPageUrl("BookingConfirmation") + `?bookingId=${booking.id}&status=success`);
    },
    onError: (error) => {
      navigate(createPageUrl("BookingConfirmation") + `?status=error&message=${encodeURIComponent(error.message)}`);
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyPromo = async () => {
    if (!formData.promoCode.trim()) return;

    setApplyingPromo(true);
    setPromoError("");

    try {
      const promoCodes = await base44.entities.PromoCode.filter({
        code: formData.promoCode.toUpperCase(),
        active: true
      });

      if (promoCodes.length === 0) {
        setPromoError("Invalid or expired promo code");
        setPromoDiscount(null);
      } else {
        const promo = promoCodes[0];
        let discount = 0;

        if (promo.discount_type === "percentage") {
          discount = (experience.price * promo.discount_value) / 100;
        } else {
          discount = promo.discount_value;
        }

        setPromoDiscount({
          amount: discount,
          code: promo.code,
          type: promo.discount_type,
          value: promo.discount_value
        });
        setPromoError("");
      }
    } catch (error) {
      setPromoError("Error validating promo code");
      setPromoDiscount(null);
    }

    setApplyingPromo(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const baseAmount = experience.price;
    const discountAmount = promoDiscount?.amount || 0;
    const totalAmount = Math.max(0, baseAmount - discountAmount);

    const bookingData = {
      experience_id: experienceId,
      slot_id: slotId,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      base_amount: baseAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      promo_code: promoDiscount?.code || "",
      status: "confirmed"
    };

    createBookingMutation.mutate(bookingData);
  };

  if (!experienceId || !slotId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[#6B7280] mb-4">Invalid booking details</p>
        <Button onClick={() => navigate(createPageUrl("Home"))} className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222]">
          Back to Home
        </Button>
      </div>
    );
  }

  if (!experience || !slot) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFD166]" />
      </div>
    );
  }

  const baseAmount = experience.price;
  const discountAmount = promoDiscount?.amount || 0;
  const totalAmount = Math.max(0, baseAmount - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6 border-[#E5E7EB] hover:bg-[#FAFAFA]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-3">
          <Card className="p-6 md:p-8 border-[#E5E7EB]">
            <h2 className="text-2xl font-bold text-[#222222] mb-6">Booking Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-[#222222] font-medium mb-2 block">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`border-[#E5E7EB] ${errors.name ? 'border-[#EF4444]' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-[#EF4444] text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-[#222222] font-medium mb-2 block">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`border-[#E5E7EB] ${errors.email ? 'border-[#EF4444]' : ''}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-[#EF4444] text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-[#222222] font-medium mb-2 block">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`border-[#E5E7EB] ${errors.phone ? 'border-[#EF4444]' : ''}`}
                  placeholder="10-digit phone number"
                />
                {errors.phone && (
                  <p className="text-[#EF4444] text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Promo Code */}
              <div>
                <Label htmlFor="promo" className="text-[#222222] font-medium mb-2 block">
                  Promo Code (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                    className="border-[#E5E7EB]"
                    placeholder="Enter promo code"
                    disabled={!!promoDiscount}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={applyingPromo || !formData.promoCode || !!promoDiscount}
                    className="bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold whitespace-nowrap"
                  >
                    {applyingPromo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : promoDiscount ? (
                      "Applied"
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-[#EF4444] text-sm mt-1">{promoError}</p>
                )}
                {promoDiscount && (
                  <Alert className="mt-2 border-[#10B981] bg-[#10B981]/10">
                    <Tag className="w-4 h-4 text-[#10B981]" />
                    <AlertDescription className="text-[#10B981] font-medium">
                      Promo code applied! You saved ₹{promoDiscount.amount}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="w-full bg-[#FFD166] hover:bg-[#FFAD33] text-[#222222] font-semibold py-6 text-lg rounded-xl"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-[#E5E7EB] sticky top-24">
            <h3 className="text-xl font-semibold text-[#222222] mb-4">Booking Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Experience</span>
                <span className="font-medium text-[#222222] text-right">{experience.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Date</span>
                <span className="font-medium text-[#222222]">
                  {format(new Date(slot.date), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Time</span>
                <span className="font-medium text-[#222222]">{slot.time}</span>
              </div>

              <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Base Price</span>
                  <span className="font-medium text-[#222222]">₹{baseAmount}</span>
                </div>
                {promoDiscount && (
                  <div className="flex justify-between text-[#10B981]">
                    <span>Discount ({promoDiscount.code})</span>
                    <span className="font-medium">-₹{discountAmount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-semibold text-[#222222]">Total Amount</span>
                <span className="text-3xl font-bold text-[#222222]">₹{totalAmount}</span>
              </div>
              <p className="text-xs text-[#6B7280]">All taxes and fees included</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}