import React, { createContext, useState } from "react";

const PageTitleContext = createContext();

const PageTitleProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("Dashboard");

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

export { PageTitleContext, PageTitleProvider };
