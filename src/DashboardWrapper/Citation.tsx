import React, { useState, useEffect } from 'react';
import { Search, Copy, Plus } from 'lucide-react';
import qs from 'qs';

interface CitationStyle {
  citationName: string;
  citationShortName: string | null;
  citationFile: string;
}

interface BookResult {
  title: string;
  authors: string[];
  publisher: string;
  date: string;
  categories: string[];
  thumbnail: string;
  pages: number;
}

interface WebsiteResult {
  title: string;
  authors: string[];
  publisher: string;
  date: string;
  description: string;
  url: string;
  'container-title': string;
}

interface CitationData {
  style: string;
  type: string;
  title?: string;
  author?: Array<{ type: string; first?: string; last?: string; full?: string }>;
  publisher?: string;
  issued?: { 'date-parts': number[][] };
  'container-title'?: string;
  URL?: string;
}



const CitationGenerator: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [citation, setCitation] = useState('Your citation will appear here...');
  const [selectedStyle, setSelectedStyle] = useState('mla-9');
  const [availableStyles, setAvailableStyles] = useState<CitationStyle[]>([]);
  const [searchResults, setSearchResults] = useState<(BookResult | WebsiteResult)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchType, setSearchType] = useState<'book' | 'website'>('book');
 const [isDropDownOpen, setIsDropdownOpen] = useState(false);

  // Use Flask backend as proxy
 const API_BASE = import.meta.env.VITE_BACKEND_URL;


  // Load citation styles on component mount
  useEffect(() => {
    loadCitationStyles();
  }, []);

  

  const loadCitationStyles = async () => {
  try {
    console.log('Loading citation styles...');
    const response = await fetch(`${API_BASE}/styles?limit=50`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Styles API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const styles = (data.citationStyles || []).map((style: Partial<CitationStyle>)=> ({
      citationFile: style.citationFile ?? 'unknown.csl',
      citationName: style.citationName ?? style.citationFile?.replace(/\.csl$/, '').replace(/-/g, ' ') ?? 'Unnamed Style',
      citationShortName: style.citationShortName ?? null,
    }));

    setAvailableStyles(styles);
  } catch (error) {
    console.error('Failed to load citation styles:', error);
    // Fallback styles with .csl extension
    setAvailableStyles([
      { citationName: 'MLA 9th edition', citationShortName: 'MLA 9', citationFile: 'modern-language-association.csl' },
      { citationName: 'MLA 7th edition', citationShortName: 'MLA 7', citationFile: 'modern-language-association-7th-edition.csl' },
      { citationName: 'Chicago Manual of Style', citationShortName: 'Chicago', citationFile: 'chicago-fullnote-bibliography.csl' },
      { citationName: 'American Psychological Association 7th edition', citationShortName: 'APA', citationFile: 'apa.csl' },
    ]);
  }
};


  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setCitation('Searching...');

    try {
      const isUrlSearch = isUrl(searchQuery);
      setSearchType(isUrlSearch ? 'website' : 'book');

      let response;

      if (isUrlSearch) {
        console.log('Searching for website:', searchQuery);
        response = await fetch(`${API_BASE}/website?url=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
      } else {
        console.log('Searching for book:', searchQuery);
        response = await fetch(`${API_BASE}/books?q=${encodeURIComponent(searchQuery)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Search data:', data);

      if (isUrlSearch) {
        setSearchResults([data]);
        await generateCitationFromWebsite(data);
      } else {
        if (Array.isArray(data) && data.length > 0) {
          setSearchResults(data);
          await generateCitationFromBook(data[0]);
        } else {
          setSearchResults([]);
          setCitation('No results found. Try a different search term.');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCitation(`Citation failed: ${errorMessage}. Please try manual entry.`);
    } finally {
      setIsSearching(false);
    }
  };

  const generateCitationFromBook = async (book: BookResult) => {
    const citationData: CitationData = {
      style: getStyleFile(selectedStyle),
      type: 'book',
      title: book.title,
      author: book.authors.map(author => {
        const parts = author.split(' ');
        const last = parts.pop() || '';
        const first = parts.join(' ');
        return { type: 'Person', first, last };
      }),
      publisher: book.publisher,
      issued: book.date
        ? {
            'date-parts': [
              [
                parseInt(book.date.split('-')[0], 10), // Year
                parseInt(book.date.split('-')[1], 10) || 1, // Month
                parseInt(book.date.split('-')[2], 10) || 1, // Day
              ],
            ],
          }
        : { 'date-parts': [[2025, 1, 1]] }, // Fallback date
    };

    await generateCitation(citationData);
  };

  const generateCitationFromWebsite = async (website: WebsiteResult) => {
    const citationData: CitationData = {
      style: getStyleFile(selectedStyle),
      type: 'webpage',
      title: website.title,
      author: website.authors?.length
        ? website.authors.map(author => {
            const parts = author.split(' ');
            const last = parts.pop() || '';
            const first = parts.join(' ');
            return { type: 'Person', first, last };
          })
        : [{ type: 'Person', first: '', last: '' }], // Empty author if none
      'container-title': website['container-title'] || website.publisher,
      URL: website.url,
      issued: website.date
        ? {
            'date-parts': [
              [
                parseInt(website.date.split('-')[0], 10), // Year
                parseInt(website.date.split('-')[1], 10) || 1, // Month
                parseInt(website.date.split('-')[2], 10) || 1, // Day
              ],
            ],
          }
        : { 'date-parts': [[2025, 1, 1]] }, // Fallback date
    };

    await generateCitation(citationData);
  };

  const generateCitation = async (citationData: CitationData) => {
    try {
      console.log('Generating citation with data:', citationData);

      // Use qs.stringify to create query string
      const params = qs.stringify(citationData, { format: 'RFC3986' });
      const url = `${API_BASE}/cite?${params}`;
      console.log('Citation API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Citation API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Citation response:', data);

      if (data && Array.isArray(data) && data.length > 0) {
        // Remove HTML tags and clean up the citation
        const cleanCitation = data[0].replace(/<[^>]*>/g, '').trim();
        setCitation(cleanCitation);
      } else {
        setCitation('Unable to generate citation. Please try manual entry.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCitation(`Citation failed: ${errorMessage}. Please try manual entry.`);
    }
  };

  const getStyleFile = (styleKey: string) => {
    const styleMap: { [key: string]: string } = {
      'mla-9': 'modern-language-association.csl',
      'mla-7': 'modern-language-association-7th-edition.csl',
      'chicago': 'chicago-fullnote-bibliography.csl',
      'apa': 'apa.csl',
    };

    const style = availableStyles.find(s =>
      s.citationShortName?.toLowerCase().replace(/\s+/g, '-') === styleKey ||
      s.citationFile === styleMap[styleKey]
    );
    return style?.citationFile || styleMap[styleKey] || 'modern-language-association.csl';
  };

  const handleStyleChange = async (newStyle: string) => {
    setSelectedStyle(newStyle);

    // Regenerate citation with new style if we have results
    if (searchResults.length > 0) {
      const result = searchResults[0];
      if (searchType === 'book') {
        await generateCitationFromBook(result as BookResult);
      } else {
        await generateCitationFromWebsite(result as WebsiteResult);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(citation);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center pb-12">
          <h1 className="text-6xl font-light text-gray-800 mb-4 text-center"></h1>
          <p className="text-xl text-gray-600 mb-8 text-center">Effortless Citation Generation in MLA,APA and Chicago Styles </p>
          
        </div>

        {/* Search Input */}
        <div className="pb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter URL/Book Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Citation Display */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <p className="text-gray-700 text-lg leading-relaxed italic">
                {citation}
              </p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Copy citation"
              >
                <Copy className="w-5 h-5" />
              </button>
           
            </div>
          </div>

          {/* Style Selector */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStyleChange('mla-9')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStyle === 'mla-9'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              MLA 9
            </button>
            <button
              onClick={() => handleStyleChange('mla-7')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStyle === 'mla-7'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              MLA 7
            </button>
            <button
              onClick={() => handleStyleChange('chicago')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStyle === 'chicago'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chicago
            </button>
            <button
              onClick={() => handleStyleChange('apa')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStyle === 'apa'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              APA
            </button>
            <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropDownOpen)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
              More
            </button>
           {isDropDownOpen && (
  <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
    {availableStyles.map((style) => (
      <button
        key={style.citationFile}
        onClick={() => {
          handleStyleChange(
            style.citationName?.toLowerCase().replace(/\s+/g, '-') || style.citationFile
          );
          setIsDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {style.citationShortName || style.citationName}
      </button>
    ))}
  </div>
)}

            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Search Results</h3>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  {searchType === 'book' ? (
                    <div className="flex space-x-4">
                      {(result as BookResult).thumbnail && (
                        <img
                          src={(result as BookResult).thumbnail}
                          alt="Book cover"
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-800">{result.title}</h4>
                        <p className="text-gray-600">
                          {(result as BookResult).authors.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(result as BookResult).publisher} • {(result as BookResult).date}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-gray-800">{result.title}</h4>
                      <p className="text-gray-600">
                        {(result as WebsiteResult).authors?.join(', ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(result as WebsiteResult).publisher} • {(result as WebsiteResult).date}
                      </p>
                      <p className="text-sm text-blue-500 break-all">
                        {(result as WebsiteResult).url}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

     
      </div>
    </div>
  );
};

export default CitationGenerator;