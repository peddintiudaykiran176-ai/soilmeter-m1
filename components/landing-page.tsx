"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BatteryFull,
  Check,
  Droplets,
  Leaf,
  Radio,
  ShieldCheck,
  Sprout,
  Wifi,
} from "lucide-react";

const crops = {
  Tomato: {
    moisture: 68,
    status: "In a healthy range",
    temperature: "21.4°",
    lastWatered: "2 days ago",
    color: "bg-emerald-500",
    bars: [38, 48, 42, 65, 60, 75, 68],
  },
  Corn: {
    moisture: 42,
    status: "A little thirsty",
    temperature: "24.8°",
    lastWatered: "4 days ago",
    color: "bg-amber-500",
    bars: [72, 65, 59, 54, 51, 45, 42],
  },
  Lettuce: {
    moisture: 81,
    status: "Soil is well hydrated",
    temperature: "18.6°",
    lastWatered: "Yesterday",
    color: "bg-emerald-500",
    bars: [48, 61, 58, 73, 70, 87, 81],
  },
};

type Crop = keyof typeof crops;

const features = [
  {
    icon: Droplets,
    title: "Moisture, measured right",
    description:
      "See what roots actually feel. Track soil moisture where it matters, not just at the surface.",
    number: "01",
  },
  {
    icon: Radio,
    title: "Your field, always in reach",
    description:
      "Wireless readings bring field conditions to your dashboard, so checking in takes seconds.",
    number: "02",
  },
  {
    icon: Sprout,
    title: "Water with more confidence",
    description:
      "Spot changing conditions sooner and make irrigation decisions with the full picture.",
    number: "03",
  },
];

export function LandingPage() {
  const [selectedCrop, setSelectedCrop] = useState<Crop>("Tomato");
  const reading = crops[selectedCrop];

  return (
    <main className="min-h-screen overflow-hidden bg-[#fafbf7] text-[#183b2c]">
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:min-h-[650px] lg:grid-cols-[1fr_0.95fr] lg:gap-8 lg:px-12 lg:py-16">
        <div className="relative z-10 max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dbe8da] bg-white/80 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#477454]">
            <span className="size-1.5 rounded-full bg-[#61a66f]" />
            Meet SoilMeter M1
          </div>
          <h1 className="max-w-[660px] text-[clamp(3.2rem,7vw,5.6rem)] font-medium leading-[0.98] tracking-[-0.075em] text-[#183b2c]">
            Grow with
            <br />
            <span className="font-serif font-normal italic text-[#719777]">good</span>{" "}
            information.
          </h1>
          <p className="mt-7 max-w-[470px] text-base leading-7 text-[#647569] sm:text-lg sm:leading-8">
            Healthy crops start below the surface. Get a clearer read on your
            soil and make every watering decision count.
          </p>
          <div className="mt-9 flex flex-col gap-3 min-[420px]:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1f513b] px-6 text-sm font-medium text-white shadow-[0_8px_24px_rgba(31,81,59,0.16)] transition hover:-translate-y-0.5 hover:bg-[#17412f]"
            >
              Explore SoilMeter M1 <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#dfe8de] bg-white/70 px-6 text-sm font-medium text-[#315744] transition hover:bg-white"
            >
              See how it works <ArrowDown size={15} />
            </a>
          </div>
          <div className="mt-9 flex items-center gap-3 text-xs text-[#78877a]">
            <div className="flex -space-x-2">
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-[#fafbf7] bg-[#dce9d5] text-[#42684a]">
                <Leaf size={13} />
              </span>
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-[#fafbf7] bg-[#f3e7d0] text-[#8b7141]">
                <Sprout size={13} />
              </span>
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-[#fafbf7] bg-[#dce9e3] text-[#416d61]">
                <Droplets size={13} />
              </span>
            </div>
            <span>Made for people who grow things</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[550px] lg:ml-auto">
          <div className="absolute -right-8 top-2 size-28 rounded-full bg-[#e6eddc] blur-2xl sm:-right-4 sm:size-40" />
          <div className="absolute -bottom-5 -left-3 size-36 rounded-full bg-[#e1ebdd] blur-2xl" />
          <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#edf2e8] sm:min-h-[480px]">
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(#a7bba3_0.7px,transparent_0.7px)] [background-size:18px_18px]" />
            <div className="absolute left-7 top-8 flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-[11px] font-medium text-[#52685a] shadow-sm backdrop-blur">
              <span className="size-1.5 rounded-full bg-[#55a96b]" />
              SoilMeter M1 · Field ready
            </div>
            <div className="absolute bottom-8 left-7 hidden max-w-[170px] rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_12px_35px_rgba(36,67,45,0.08)] backdrop-blur sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#89958b]">
                In the soil
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#284b36]">A better kind of insight.</p>
            </div>
            <div className="absolute right-5 top-1/2 z-10 w-[145px] -translate-y-1/2 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-[0_14px_38px_rgba(36,67,45,0.1)] backdrop-blur sm:right-6 sm:w-[158px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#849185]">SOIL MOISTURE</span>
                <Wifi size={13} className="text-[#64a16e]" />
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[30px] font-medium tracking-[-0.06em] text-[#244b35]">68</span>
                <span className="text-sm text-[#6a816e]">%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eaf0e8]">
                <div className="h-full w-[68%] rounded-full bg-[#69a875]" />
              </div>
              <p className="mt-2.5 text-[10px] text-[#6d7f70]">Looking good today</p>
            </div>
            <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-medium text-[#587360] shadow-sm sm:bottom-7 sm:right-7">
              <BatteryFull size={14} className="text-[#68a573]" />
              Built for the outdoors
            </div>
            <Image
              src="/soil_sensor.png"
              alt="SoilMeter M1 wireless soil sensor with metal soil probes"
              width={345}
              height={550}
              priority
              className="relative z-[1] h-[360px] w-auto max-w-[66%] object-contain drop-shadow-[0_24px_28px_rgba(27,54,40,0.17)] sm:h-[435px]"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7ece4] bg-white/70" aria-label="Product highlights">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-7 px-5 py-7 sm:px-8 md:grid-cols-4 md:gap-0 lg:px-12">
          {[
            ["01", "Soil moisture", "Know what roots feel"],
            ["02", "Wireless readings", "Check in from anywhere"],
            ["03", "Built for outdoors", "Ready for the field"],
            ["04", "Smarter watering", "Act with confidence"],
          ].map(([number, title, detail]) => (
            <div key={number} className="flex gap-3 md:border-r md:border-[#e7ece4] md:px-6 first:md:pl-0 last:md:border-0">
              <span className="pt-0.5 text-[10px] font-semibold tracking-widest text-[#89a38a]">{number}</span>
              <div>
                <p className="text-sm font-medium text-[#294b36]">{title}</p>
                <p className="mt-1 text-xs text-[#869187]">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78a07b]">From soil to signal</p>
          <h2 className="mt-4 max-w-md text-4xl font-medium leading-[1.08] tracking-[-0.055em] text-[#1b3d2c] sm:text-5xl">
            A little more insight goes a long way.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-[#6d7d70]">
            SoilMeter M1 keeps an eye on what you can’t see, helping turn
            everyday field conditions into an easier next step.
          </p>
          <a className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#326343] transition hover:gap-3" href="#demo">
            Try the interactive demo <ArrowRight size={15} />
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description, number }) => (
            <article key={number} className="group rounded-2xl border border-[#e5ebe2] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#cbdcc9] hover:shadow-[0_16px_40px_rgba(32,68,43,0.07)] sm:p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#eff5ed] text-[#54815d] transition group-hover:bg-[#e2eee0]">
                  <Icon size={19} strokeWidth={1.7} />
                </span>
                <span className="text-[10px] font-medium tracking-widest text-[#a6b2a5]">{number}</span>
              </div>
              <h3 className="mt-7 text-[15px] font-medium leading-5 text-[#294b36]">{title}</h3>
              <p className="mt-2.5 text-[12px] leading-5 text-[#7c897e]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="bg-[#1c4431] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a2c6a2]">Made to grow with you</p>
            <h2 className="mt-4 max-w-lg text-4xl font-medium leading-[1.08] tracking-[-0.055em] sm:text-5xl">
              Your field has a story. Start reading it.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#c2d2c4]">
              Get a useful snapshot of field conditions without making
              monitoring another chore. Simple readings, ready when you are.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "A quick view of soil moisture conditions",
                "Wireless monitoring from your dashboard",
                "A helpful starting point for irrigation decisions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-[#e2ece1]">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#477352]">
                    <Check size={12} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/register" className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-[#edf4e9] px-6 text-sm font-medium text-[#214a34] transition hover:bg-white">
              Get started <ArrowUpRight size={15} />
            </Link>
          </div>
          <div id="demo" className="scroll-mt-8 rounded-[1.75rem] bg-[#f9fbf6] p-5 text-[#244532] shadow-[0_28px_70px_rgba(9,28,17,0.18)] sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#849185]">
                  <span className="size-1.5 rounded-full bg-[#66a873]" /> Sample field readings
                </div>
                <h3 className="mt-2 text-xl font-medium tracking-[-0.04em]">Field overview</h3>
              </div>
              <span className="rounded-full border border-[#e3eae0] bg-white px-3 py-1.5 text-[10px] font-medium text-[#718074]">
                Example data
              </span>
            </div>

            <div className="mt-6 flex gap-2" role="group" aria-label="Choose a crop for sample readings">
              {(Object.keys(crops) as Crop[]).map((crop) => (
                <button
                  type="button"
                  key={crop}
                  aria-pressed={selectedCrop === crop}
                  onClick={() => setSelectedCrop(crop)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    selectedCrop === crop
                      ? "bg-[#28583d] text-white shadow-sm"
                      : "border border-[#e5ebe2] bg-white text-[#718074] hover:border-[#cbdcc9] hover:text-[#315b3c]"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_0.75fr]">
              <div className="rounded-2xl border border-[#e7ece4] bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#78867a]">Soil moisture</p>
                  <Droplets size={16} className="text-[#6b9f70]" />
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-medium tracking-[-0.07em] text-[#244b35]">{reading.moisture}</span>
                    <span className="text-lg text-[#759079]">%</span>
                  </div>
                  <span className="mb-1 rounded-full bg-[#edf5eb] px-2.5 py-1 text-[10px] font-medium text-[#55815c]">
                    {reading.status}
                  </span>
                </div>
                <div className="mt-4 flex h-[92px] items-end gap-2 border-b border-[#e8eee6] pb-2">
                  {reading.bars.map((value, index) => (
                    <div key={`${selectedCrop}-${index}`} className="flex h-full flex-1 items-end">
                      <div
                        className={`w-full rounded-t-[5px] ${reading.color} transition-[height] duration-500 ease-out`}
                        style={{ height: `${value}%`, opacity: 0.48 + index * 0.07 }}
                        aria-label={`Day ${index + 1}: ${value}%`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[9px] text-[#9aa59a]">
                  <span>7 days ago</span>
                  <span>Today</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                <div className="rounded-2xl border border-[#e7ece4] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#78867a]">Soil temperature</span>
                    <span className="text-sm">☼</span>
                  </div>
                  <p className="mt-3 text-2xl font-medium tracking-[-0.05em] text-[#244b35]">{reading.temperature}</p>
                  <p className="mt-1 text-[10px] text-[#9aa59a]">Degrees Celsius</p>
                </div>
                <div className="rounded-2xl border border-[#e7ece4] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#78867a]">Last watered</span>
                    <ShieldCheck size={15} className="text-[#77a17c]" />
                  </div>
                  <p className="mt-3 text-lg font-medium tracking-[-0.04em] text-[#244b35]">{reading.lastWatered}</p>
                  <p className="mt-1 text-[10px] text-[#9aa59a]">Sample field update</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] leading-4 text-[#89958b]">
              Demo values are illustrative and do not represent live sensor data.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center lg:px-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78a07b]">A better read on your soil</p>
          <h2 className="mt-3 text-3xl font-medium tracking-[-0.05em] text-[#1b3d2c] sm:text-4xl">
            Grow a little more confidently.
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#718074]">
            Bring the conditions beneath the surface into your everyday view.
          </p>
        </div>
        <Link href="/register" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#1f513b] px-6 text-sm font-medium text-white transition hover:bg-[#17412f]">
          Create your account <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-[#e7ece4] bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 text-xs text-[#879287] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link href="/" className="flex items-center gap-2 font-medium text-[#42634b]">
            <Sprout size={15} /> soilmeter<span className="-ml-2 text-[#87a886]">.</span>
          </Link>
          <p>Thoughtful growing starts beneath the surface.</p>
          <p>© SoilMeter M1</p>
        </div>
      </footer>
    </main>
  );
}
