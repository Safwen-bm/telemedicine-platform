import React from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { HiStar } from "react-icons/hi";

const Testimonial = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-5 text-center">

        <Swiper
          modules={[Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name} avatar`}
                    className="w-14 h-14 rounded-full border-2 border-[#2563EB] object-cover"
                  />
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, idx) => (
                        <HiStar key={idx} className="text-yellow-400 w-5 h-5" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mt-5 text-sm leading-relaxed">
                  “{testimonial.message}”
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

const testimonials = [
  {
    name: "Aisha Khan",
    message: "A truly professional service. The doctors were exceptional!",
    avatar: "/avatarf.jpg",
  },
  {
    name: "James Carter",
    message: "Seamless and caring. Made my health concerns so much easier to manage.",
    avatar: "/avatarm.jpg",
  },
  {
    name: "Fatima Al-Sayed",
    message: "Highly attentive doctors. An outstanding telehealth experience.",
    avatar: "/avatarf.jpg",
  },
  {
    name: "Liam Nguyen",
    message: "Efficient and reliable service. I felt truly cared for.",
    avatar: "/avatarm.jpg",
  },
  {
    name: "Sofia Morales",
    message: "The best teleconsultation platform I’ve used. Highly recommend!",
    avatar: "/avatarf.jpg",
  },
];

export default Testimonial;
