"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen text-white bg-[#0a0a0f]">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-red-400 mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-amber-500 rounded text-black font-semibold hover:bg-amber-400"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
