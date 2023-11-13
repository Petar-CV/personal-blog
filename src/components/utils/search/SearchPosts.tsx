import Fuse, { type FuseResult } from 'fuse.js';
import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
import type { CollectionEntry } from 'astro:content';

export type SearchPostItem = {
  slug: string;
  body: string;
  data: CollectionEntry<'blog'>['data'];
};

interface Props {
  searchList: SearchPostItem[];
}

export default function SearchPosts({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState('');
  const [searchResults, setSearchResults] = useState<
    FuseResult<SearchPostItem>[] | null
  >(null);

  const handleChange = (e: any) => {
    setInputVal(e.currentTarget.value);
  };

  const onClearSearch = () => {
    setInputVal('');
    inputRef.current?.focus();
  };

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ['data.title', 'data.description', 'body'],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.5,
      }),
    [searchList],
  );

  useEffect(() => {
    // If URL has search query, insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get('q');
    if (searchStr) setInputVal(searchStr);

    // Put focus cursor at the end of the string
    setTimeout(() => {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    let inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];

    setSearchResults(inputResult);

    // Update search string in URL
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set('q', inputVal);
      const newRelativePathQuery =
        window.location.pathname + '?' + searchParams.toString();
      history.replaceState(history.state, '', newRelativePathQuery);
    } else {
      history.replaceState(history.state, '', window.location.pathname);
    }
  }, [inputVal]);

  return (
    <>
      <div className='flex flex-row gap-4 border border-opacity-40 bg-zinc-200 opacity-75 dark:bg-blue-chill-900'>
        <span className='flex items-center pl-3'>
          <svg
            class='h-5 w-5 align-middle'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
          >
            <path d='M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z'></path>
          </svg>
        </span>
        <input
          className='block w-full flex-1 rounded py-3 pr-3 placeholder:italic placeholder:text-opacity-75 focus:outline-none'
          placeholder='Search for anything...'
          type='text'
          name='search'
          value={inputVal}
          onInput={handleChange}
          autoComplete='off'
          autoFocus
          ref={inputRef}
        />
        <button
          className='flex items-center pr-3'
          onClick={onClearSearch}
          aria-label='Clear search'
        >
          <span class='screen-reader-only'>Clear search</span>
          <svg
            class='h-5 w-5 align-middle'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 50 50'
            fill='currentColor'
            stroke='currentColor'
          >
            <path d='M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z'></path>
          </svg>
        </button>
      </div>

      {inputVal.length > 1 && (
        <div className='my-4'>
          Found {searchResults?.length}
          {searchResults?.length && searchResults?.length === 1
            ? ' result'
            : ' results'}{' '}
          for '{inputVal}'
        </div>
      )}

      <ul class='space-y-4'>
        {searchResults &&
          searchResults.map(({ item, refIndex }) => (
            <li class='flex' key={`${refIndex}-${item.slug}`}>
              <a
                href={`/blog/${item.slug}`}
                class='flex flex-row items-center gap-2'
              >
                <img
                  width={200}
                  height={200}
                  class='transition-all duration-300 ease-in-out hover:-mt-3 hover:mb-3'
                  src={item.data.heroImage.src}
                  alt=''
                />

                <div>
                  <h2 class='text-xl font-bold'>{item.data.title}</h2>
                </div>
              </a>
            </li>
          ))}
      </ul>
    </>
  );
}
