import React from "react";
import { assets } from "../assets/data";
import { Link } from "react-router-dom";

const SmallBoxes = () => {
  const boxItems = [
    {
      id: 1,
      title: "Buy Solar Bundles",
      color: "#0000ff",
      icon: assets.vec1,
      link: "/buy-now",
    },
    {
      id: 2,
      title: "Buy Now, Pay Later",
      color: "#ff0000",
      icon: assets.vec2,
      link: "/bnpl",
    },
    {
      id: 3,
      title: "Shop Solar Products",
      color: "#800080",
      icon: assets.vec3,
      link: "/shop",
    },
    {
      id: 4,
      title: "Load & Savings Calculator",
      color: "#008000",
      icon: assets.vec4,
      link: "/tools",
    },
  ];

  return (
    <>
      {/* Desktop View  */}
      <div className="gap-5 sm:grid lg:grid-cols-4  hidden md:grid-cols-3 grid-cols-2">
        {boxItems.map((item) => (
          <Link
            to={item.link}
            key={item.id}
            className="flex sm:flex-row flex-col rounded-xl items-center py-4 px-2 shadow-xl bg-white hover:shadow-lg transition-shadow duration-300 justify-center gap-6"
          >
            <div
              className={`bg-[${item.color}]/20 h-[80px] w-[80px] rounded-full flex justify-center items-center`}
              style={{ backgroundColor: `${item.color}20` }} // Fallback for Tailwind dynamic colors
            >
              <img
                src={item.icon}
                className="h-[40px] w-[40px]"
                alt={item.title}
              />
            </div>
            <p className={`text-[${item.color}]`} style={{ color: item.color }}>
              {item.title}
            </p>
          </Link>
        ))}
      </div>

      {/* Mobile View - 4 horizontal cards matching the photo */}
      <div className="gap-3 grid grid-cols-4 sm:hidden">
        {boxItems.map((item) => (
          <Link
            to={item.link}
            key={item.id}
            className="flex flex-col rounded-xl items-center py-3 px-2 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 justify-center gap-2"
          >
            <div
              className="h-[50px] w-[50px] rounded-full flex justify-center items-center"
              style={{ backgroundColor: `${item.color}20` }} // Light background color
            >
              <img
                src={item.icon}
                className="h-[24px] w-[24px]"
                alt={item.title}
                style={{
                  filter: `brightness(0) saturate(100%) ${
                    item.color === "#0000ff"
                      ? "invert(27%) sepia(51%) saturate(2878%) hue-rotate(224deg) brightness(89%) contrast(97%)"
                      : item.color === "#ff0000"
                      ? "invert(13%) sepia(94%) saturate(7151%) hue-rotate(360deg) brightness(91%) contrast(118%)"
                      : item.color === "#800080"
                      ? "invert(20%) sepia(100%) saturate(7500%) hue-rotate(300deg) brightness(101%) contrast(102%)"
                      : "invert(25%) sepia(100%) saturate(7500%) hue-rotate(120deg) brightness(101%) contrast(102%)"
                  }`,
                }}
              />
            </div>
            <p
              className="text-[8px] font-medium text-center leading-tight"
              style={{ color: item.color }}
            >
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
};

export default SmallBoxes;
