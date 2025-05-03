'use client';

import { useGetBreedsQuery } from "@/state/api"


export default function BreedPage() {
  const { isError, isLoading, data } = useGetBreedsQuery();

  if (isError || !data) {
    return (
      <div className="text-center text-red-500 py-5">
        Failed to fetch breeds
      </div>
    );
  }

  const sortedBreeds = [...data].sort((a, b) => a.name.localeCompare(b.name));
  let lastInitial = '';

  return (
    <div>
      <h1 className="font-semibold text-2xl text-center">Breeds</h1>
      <div>
        {isLoading ? (
          <div>
            Loading...
          </div>
        ) : (
          <div>
            {sortedBreeds.map((breed) => {
              const currentInitial = breed.name[0].toUpperCase();
              const showInitial = currentInitial !== lastInitial;
              lastInitial = currentInitial;

              return (

                <div key={breed.id} className="space-y-4" >
                  {showInitial && (
                    <div className="text-3xl font-bold mt-4 mb-1">
                      {currentInitial}
                    </div>
                  )}
                  <h3>{breed.name}</h3>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div >
  )
}
