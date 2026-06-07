'use client';

import { useEffect, useState } from 'react';

export default function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('Selamat datang');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour <= 10) {
      setGreeting('Selamat pagi');
    } else if (hour >= 11 && hour <= 14) {
      setGreeting('Selamat siang');
    } else if (hour >= 15 && hour <= 17) {
      setGreeting('Selamat sore');
    } else {
      setGreeting('Selamat malam');
    }
  }, []);

  return (
    <>
      {greeting}, {name}! 👋
    </>
  );
}
