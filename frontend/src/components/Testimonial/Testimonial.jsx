import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { HiStar } from "react-icons/hi";

const testimonials = [
  {
    name: "Aisha Mohamed",
    message: "A truly professional service. The doctors were exceptional!",
  },
  {
    name: "James Carter",
    message: "Seamless and caring. Made my health concerns so much easier to manage.",
  },
  {
    name: "Fatima Al-Sayed",
    message: "Highly attentive doctors. An outstanding telehealth experience.",
  },
  {
    name: "Liam Nguyen",
    message: "Efficient and reliable service. I felt truly cared for.",
  },
  {
    name: "Sofia Morales",
    message: "The best teleconsultation platform I've used. Highly recommend!",
  },
];

const initials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Testimonial = () => {
  return (
    <section className="bg-mint/60 py-24">
      <div className="container">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
          Patient stories
        </p>
        <h2 className="mt-3 max-w-2xl font-heading text-[38px] font-semibold leading-[1.05] sm:text-[52px]">
          What patients say after their <em className="font-normal text-coral">first visit.</em>
        </h2>

        <Swiper
          className="mt-12 !pb-14"
          style={{
            "--swiper-pagination-color": "#F0583A",
            "--swiper-pagination-bullet-inactive-color": "#10231F",
          }}
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 28 },
          }}
        >
          {testimonials.map((t) => (
            <SwiperSlide key={t.name} className="!h-auto">
              <figure className="flex h-full flex-col justify-between rounded-[14px] border border-line bg-white p-7">
                <div>
                  <span className="font-heading text-[56px] leading-none text-coral">“</span>
                  <blockquote className="-mt-3 font-heading text-[21px] leading-[1.4] text-headingColor">
                    {t.message}
                  </blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-line pt-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primaryColor font-heading text-[16px] text-white">
                    {initials(t.name)}
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-headingColor">{t.name}</p>
                    <div className="mt-0.5 flex">
                      {[...Array(5)].map((_, i) => (
                        <HiStar key={i} className="h-4 w-4 text-yellowColor" />
                      ))}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonial;