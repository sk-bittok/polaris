import React from "react";

export default function Tab({
  children,
  classNames = "",
}: {
  children: React.ReactNode;
  classNames?: string;
}) {
  return (
    <div
      className={`${classNames} sm:min-w-sm md:min-w-md lg:min-w-lg xl:min-w-6xl`}
    >
      {children}
    </div>
  );
}
