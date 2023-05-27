import React, { createContext, useState } from 'react';

const ContextBooks = createContext();

const ContextBooksProvider = ({ children }) => {
  const [booksToday, setBooksToday] = useState([]);
  const [bookingBands, setBookingBands] = useState([]);

  return (
    <ContextBooks.Provider value={{ booksToday, setBooksToday, bookingBands, setBookingBands }}>
      {children}
    </ContextBooks.Provider>
  );
};

export { ContextBooks, ContextBooksProvider };