'use client';

import { useState } from 'react';
import { Box, Badge } from '@optiaxiom/react';
import { Text } from '@/app/components/Text';
import { Input } from '@/app/components/Input';
import { Button } from '@/app/components/Button';
import {
  IconChevronDown as ChevronDown,
  IconSearch as Search,
  IconDownload as Download,
  IconEye as Eye,
} from '@tabler/icons-react';

export default function IdeaLabPage() {
  const [selectedTab, setSelectedTab] = useState('domain');
  const [country, setCountry] = useState('United States');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [domains, setDomains] = useState(['', '', '', '', '']);

  const handleDomainChange = (index: number, value: string) => {
    const newDomains = [...domains];
    newDomains[index] = value;
    setDomains(newDomains);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-slate-900">
              Idea Lab
            </h1>
            <Button
              className="flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200"
              size="sm"
            >
              <Download size={16} />
              Download As
              <ChevronDown size={16} />
            </Button>
          </div>
          <p className="text-lg text-slate-600">
            Research topics and competitor keywords to help build your content strategy.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Radio Toggle for Domain/Topic */}
          <div className="flex items-center gap-8 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="search-type"
                value="domain"
                checked={selectedTab === 'domain'}
                onChange={(e) => setSelectedTab(e.target.value)}
                className="w-4 h-4"
              />
              <Text className="text-slate-700 font-medium">Domain</Text>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="search-type"
                value="topic"
                checked={selectedTab === 'topic'}
                onChange={(e) => setSelectedTab(e.target.value)}
                className="w-4 h-4"
              />
              <Text className="text-slate-700 font-medium">Topic</Text>
            </label>
          </div>

          {/* Country Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Country
            </label>
            <div className="relative w-48">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 appearance-none cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Australia</option>
                <option>Germany</option>
                <option>France</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-600"
              />
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Input
              placeholder="Enter Topic/Domain to Explore"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400"
            />
            <Search size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Section 1: Recommended Keywords */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge variant="subtle">RECOMMENDED FOR YOU</Badge>
              <h2 className="text-2xl font-bold text-slate-900">
                Keywords with the Greatest Opportunity
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Text className="text-slate-600">Show hidden</Text>
            </label>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Enter your targeted keywords
            </button>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-slate-200 my-8" />

        {/* Section 2: Keyword Rank Analysis */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Keyword Rank Analysis
          </h2>
          <Text className="text-slate-600 mb-6">
            Compare how your keywords rank across multiple domains. Enter up to 5 domains to analyze their keyword performance and find competitive opportunities.
          </Text>

          {/* Domain Input Fields */}
          <div className="flex items-end gap-2 mb-6 flex-wrap">
            {domains.map((domain, index) => (
              <Box key={index} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`Domain ${index + 1}`}
                  value={domain}
                  onChange={(e) => handleDomainChange(index, e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 w-40"
                />
                {index < domains.length - 1 && (
                  <Text className="text-slate-400 font-medium px-2">vs</Text>
                )}
              </Box>
            ))}
          </div>

          {/* Analyze Button */}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Analyze
          </Button>
        </section>

        {/* Divider */}
        <div className="h-px bg-slate-200 my-8" />

        {/* Section 3: Your Program's Targeted Keywords */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Your Program's Targeted Keywords
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Keywords
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
