import { BsArrowUpRight, BsEnvelope, BsPhone, BsPinMap } from "react-icons/bs";

const Contact = () => {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-line bg-mint pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="container">
          <div className="max-w-[850px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
              Contact Tabibi
            </p>

            <h1 className="mt-4 font-heading text-[48px] font-semibold leading-[1.02] tracking-[-0.02em] text-headingColor sm:text-[64px] lg:text-[76px]">
              We’re here to help,
              <br />
              <em className="font-normal text-coral">
                whenever you need us.
              </em>
            </h1>

            <p className="mt-6 max-w-[600px] text-[17px] leading-7 text-textColor">
              Have a question about Tabibi, your consultation, or our services?
              Get in touch with our team and we’ll be happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Contact Information */}
            <div className="lg:col-span-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
                Get in touch
              </p>

              <h2 className="mt-3 font-heading text-[36px] font-semibold leading-[1.08] text-headingColor sm:text-[46px]">
                Let’s start
                <br />
                a conversation.
              </h2>

              <p className="mt-5 max-w-[430px] text-[16px] leading-7 text-textColor">
                Whether you need support or simply want to learn more about
                Tabibi, you can reach us through any of the channels below.
              </p>

              <div className="mt-10 space-y-7">
                {/* Email */}
                <div className="flex items-start gap-4 border-t border-line pt-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-primaryColor">
                    <BsEnvelope size={19} />
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-textColor">
                      Email
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-headingColor">
                      info@healthcare.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 border-t border-line pt-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-primaryColor">
                    <BsPhone size={19} />
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-textColor">
                      Phone
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-headingColor">
                      +1-800-555-1234
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 border-t border-line pt-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-primaryColor">
                    <BsPinMap size={19} />
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-textColor">
                      Address
                    </p>
                    <p className="mt-1 text-[16px] font-medium text-headingColor">
                      123 Health St, City, Country
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-[14px] border border-line bg-mint/50 p-6 sm:p-8 lg:p-10">
                <div className="border-b border-line pb-5">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
                    Send us a message
                  </p>

                  <h2 className="mt-2 font-heading text-[30px] font-semibold text-headingColor sm:text-[36px]">
                    How can we help?
                  </h2>
                </div>

                <div className="mt-7 space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Full name
                    </label>

                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full border-b border-line bg-transparent px-0 py-3 text-[16px] text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full border-b border-line bg-transparent px-0 py-3 text-[16px] text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Message
                    </label>

                    <textarea
                      rows="5"
                      placeholder="Tell us how we can help..."
                      className="w-full resize-none border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Submit */}
                  <button
                    type="button"
                    className="group flex w-full items-center justify-center gap-3 bg-primaryColor px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-ink"
                  >
                    Send message
                    <BsArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
