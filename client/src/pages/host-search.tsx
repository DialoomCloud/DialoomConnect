import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Navigation } from "@/components/navigation";
import { Search, User, MapPin, CheckCircle, Sparkles, Brain, X, ZoomIn, ZoomOut, Grid3X3, Plus, Minus, HelpCircle, Info, ChevronDown, Check } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType, Category, Skill, Language, Country } from "@shared/schema";
import { useExploreFilterStore, PURPOSES } from "@/stores/exploreFilterStore";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProgressiveDisclosure, ONBOARDING_SEQUENCES } from "@/components/progressive-disclosure";

type SearchResult = UserType & { relevance?: number };

export default function HostSearch() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [aiResults, setAiResults] = useState<SearchResult[]>([]);
  const [isAISearch, setIsAISearch] = useState(false);
  const [gridCols, setGridCols] = useState(3); // Default to 3 columns
  
  // Filter states from store
  const {
    minPrice,
    maxPrice,
    categories: selectedCategories,
    skills: selectedSkills,
    languages: selectedLanguages,
    purposes: selectedPurposes,
    searchTerm,
    setMinPrice,
    setMaxPrice,
    setPriceRange,
    setCategories: setSelectedCategories,
    setSkills: setSelectedSkills,
    setLanguages: setSelectedLanguages,
    setPurposes: setSelectedPurposes,
    setSearchTerm,
    clearFilters
  } = useExploreFilterStore();

  // Build query parameters for API call
  const queryParams = new URLSearchParams();
  if (selectedCategories.length > 0) queryParams.set('categories', selectedCategories.join(','));
  if (selectedSkills.length > 0) queryParams.set('skills', selectedSkills.join(','));
  if (selectedLanguages.length > 0) queryParams.set('languages', selectedLanguages.join(','));
  if (selectedPurposes.length > 0) queryParams.set('purposes', selectedPurposes.join(','));
  queryParams.set('minPrice', minPrice.toString());
  queryParams.set('maxPrice', maxPrice.toString());
  
  const queryString = queryParams.toString();
  const apiUrl = queryString ? `/api/hosts?${queryString}` : '/api/hosts';

  const { data: hosts, isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/hosts", selectedCategories, selectedSkills, selectedLanguages, selectedPurposes, minPrice, maxPrice],
    queryFn: () => fetch(apiUrl).then(res => res.json()),
  });

  // Remove social profiles query since we no longer show them in host cards
  // const { data: hostsSocialProfiles = [] } = useQuery<any[]>({
  //   queryKey: ["/api/hosts/social-profiles"],
  // });

  // Fetch filter options
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: skills = [] } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  // AI Search mutation
  const aiSearchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch("/api/hosts/search", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setAiResults(data.results || []);
      setIsAISearch(true);
    },
    onError: (error) => {
      console.error("AI search failed:", error);
      setIsAISearch(false);
    }
  });

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.length > 2) {
        // Trigger AI search for meaningful queries
        aiSearchMutation.mutate(searchTerm);
      } else {
        setIsAISearch(false);
        setAiResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredHosts = hosts?.filter((host) => {
    // Text search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const textMatch = (
        host.firstName?.toLowerCase().includes(search) ||
        host.lastName?.toLowerCase().includes(search) ||
        host.email?.toLowerCase().includes(search) ||
        host.title?.toLowerCase().includes(search)
      );
      if (!textMatch) return false;
    }

    // Categories filter (multi-select)
    if (selectedCategories.length > 0 && host.categoryId) {
      if (!selectedCategories.includes(host.categoryId.toString())) {
        return false;
      }
    }

    // Skills filter (multi-select)
    if (selectedSkills.length > 0) {
      // TODO: Implement when user-skills relationship is properly set up
      // For now, we skip this filter since the relationship isn't established yet
    }

    // Languages filter (multi-select)
    if (selectedLanguages.length > 0) {
      // TODO: Implement when user-languages relationship is properly set up
      // For now, we skip this filter since the relationship isn't established yet
    }

    // Price range filter - placeholder until we have actual pricing data
    // For now we'll just ignore this filter since we don't have pricing info
    // if (minPrice > 0 || maxPrice < 200) {
    //   // Would filter by actual host pricing here
    // }

    return true;
  });

  const displayHosts = isAISearch ? aiResults : filteredHosts;

  return (
    <div className="min-h-screen bg-[hsl(220,9%,98%)]">
      <Navigation />
      
      {/* Progressive Disclosure for Host Search Flow */}
      <ProgressiveDisclosure steps={ONBOARDING_SEQUENCES.hostSearch} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-[hsl(17,12%,6%)] mb-4">{t('hosts.exploreTitle')}</h1>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            {t('hosts.subtitle')} <br />
            <span className="inline-flex items-center gap-1 text-[hsl(188,100%,38%)] font-medium">
              <Brain className="w-4 h-4" />
              {isAISearch ? t('hosts.aiSearchActive') : t('hosts.aiSearchHint')}
            </span>
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {aiSearchMutation.isPending ? (
                <Sparkles className="absolute left-3 top-3 h-5 w-5 text-[hsl(188,100%,38%)] animate-spin" />
              ) : (
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              )}
              <Input
                type="text"
                placeholder={t('hosts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg shadow-lg border-0 focus:ring-2 focus:ring-[hsl(188,100%,38%)] transition-all ai-search-input"
              />
              {isAISearch && (
                <div className="absolute right-3 top-3">
                  <Badge className="bg-[hsl(188,100%,38%)] text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Search status */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              {isAISearch && aiResults.length > 0 && (
                <p className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4 text-[hsl(188,100%,38%)]" />
                  {t('hosts.foundResults', { count: aiResults.length })}
                </p>
              )}
              {aiSearchMutation.isPending && (
                <p className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-[hsl(188,100%,38%)]" />
                  {t('hosts.analyzing')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Filters Section */}
        <TooltipProvider>
        <div className="mb-8 sticky top-0 z-20 bg-[hsl(220,9%,98%)] sm:static">
          <div className="flex justify-end mb-4">
            {(selectedCategories.length > 0 || selectedSkills.length > 0 || selectedLanguages.length > 0 || selectedPurposes.length > 0 || minPrice > 0 || maxPrice < 200) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                {t('hosts.clearFilters')}
              </Button>
            )}
          </div>

          <Card className="mb-6 filter-container">
            <CardHeader>
              <CardTitle className="text-lg">{t('hosts.filters')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Category Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('profile.category')}
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Selecciona una o más categorías para filtrar hosts por su área de especialización</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between text-left font-normal"
                        >
                          <span className="truncate">
                            {selectedCategories.length === 0
                              ? "Seleccionar categorías..."
                              : selectedCategories.length === 1
                              ? categories.find(c => c.id.toString() === selectedCategories[0])?.name || "Categoría"
                              : `${selectedCategories.length} categorías seleccionadas`
                            }
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <div className="max-h-60 overflow-auto">
                          {categories.map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                const categoryId = category.id.toString();
                                if (selectedCategories.includes(categoryId)) {
                                  setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
                                } else {
                                  setSelectedCategories([...selectedCategories, categoryId]);
                                }
                              }}
                            >
                              <div className="flex items-center justify-center w-4 h-4">
                                {selectedCategories.includes(category.id.toString()) && (
                                  <Check className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
                              <span className="text-sm">
                                {t(`categories.${category.name}`, category.name)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('profile.skills')}
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filtra hosts por habilidades técnicas específicas que dominan</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between text-left font-normal"
                        >
                          <span className="truncate">
                            {selectedSkills.length === 0
                              ? "Seleccionar habilidades..."
                              : selectedSkills.length === 1
                              ? skills.find(s => s.id.toString() === selectedSkills[0])?.name || "Habilidad"
                              : `${selectedSkills.length} habilidades seleccionadas`
                            }
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <div className="max-h-60 overflow-auto">
                          {skills.map((skill) => (
                            <div
                              key={skill.id}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                const skillId = skill.id.toString();
                                if (selectedSkills.includes(skillId)) {
                                  setSelectedSkills(selectedSkills.filter(s => s !== skillId));
                                } else {
                                  setSelectedSkills([...selectedSkills, skillId]);
                                }
                              }}
                            >
                              <div className="flex items-center justify-center w-4 h-4">
                                {selectedSkills.includes(skill.id.toString()) && (
                                  <Check className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
                              <span className="text-sm">
                                {skill.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Languages Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('profile.languages')}
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Selecciona idiomas para encontrar hosts que pueden comunicarse en esos idiomas</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between text-left font-normal"
                        >
                          <span className="truncate">
                            {selectedLanguages.length === 0
                              ? "Seleccionar idiomas..."
                              : selectedLanguages.length === 1
                              ? languages.find(l => l.id.toString() === selectedLanguages[0])?.name || "Idioma"
                              : `${selectedLanguages.length} idiomas seleccionados`
                            }
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <div className="max-h-60 overflow-auto">
                          {languages.map((language) => (
                            <div
                              key={language.id}
                              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                const languageId = language.id.toString();
                                if (selectedLanguages.includes(languageId)) {
                                  setSelectedLanguages(selectedLanguages.filter(l => l !== languageId));
                                } else {
                                  setSelectedLanguages([...selectedLanguages, languageId]);
                                }
                              }}
                            >
                              <div className="flex items-center justify-center w-4 h-4">
                                {selectedLanguages.includes(language.id.toString()) && (
                                  <Check className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
                              <span className="text-sm">
                                {language.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Purpose Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Purpose
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Filtra por el propósito de la sesión: conocer personas, consulta profesional o descubrir nuevos temas</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2">
                      {PURPOSES.map((purpose) => (
                        <div key={purpose} className="flex items-center space-x-2">
                          <Checkbox
                            id={`purpose-${purpose}`}
                            checked={selectedPurposes.includes(purpose)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPurposes([...selectedPurposes, purpose]);
                              } else {
                                setSelectedPurposes(selectedPurposes.filter(p => p !== purpose));
                              }
                            }}
                          />
                          <label 
                            htmlFor={`purpose-${purpose}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {purpose}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('hosts.priceRange')} (€{minPrice} - €{maxPrice})
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Establece un rango de precios por sesión para filtrar hosts según tu presupuesto</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <PriceRangeSlider
                      values={[minPrice, maxPrice]}
                      onChange={(values) => setPriceRange(values[0], values[1])}
                      min={0}
                      max={200}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
        </TooltipProvider>

        {isLoading || aiSearchMutation.isPending ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(188,100%,38%)]"></div>
          </div>
        ) : displayHosts && displayHosts.length > 0 ? (
          <>
            {/* Grid Controls */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-1 bg-white rounded-full shadow-sm border p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGridCols(Math.max(1, gridCols - 1))}
                  disabled={gridCols <= 1}
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex items-center justify-center w-10 h-8">
                  <Grid3X3 className="w-4 h-4 text-gray-600" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGridCols(Math.min(4, gridCols + 1))}
                  disabled={gridCols >= 4}
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className={`grid gap-4 ${
              gridCols === 1 ? 'grid-cols-1' :
              gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' :
              gridCols === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
              'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
            {displayHosts.map((host, index) => (
              <Card
                key={host.id}
                className="bg-white border-[hsl(220,13%,90%)] shadow-lg hover-lift animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/host/${host.id}`)}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-48 h-48 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-4 border-[hsl(188,100%,95%)] animate-glow">
                      {host.profileImageUrl ? (
                        <img
                          src={host.profileImageUrl.startsWith('http') || host.profileImageUrl.startsWith('/') ? host.profileImageUrl : `/storage/${host.profileImageUrl}`}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-24 h-24 text-gray-400" />
                      )}
                    </div>
                    {host.title && (
                      <h3 className="text-xl font-bold text-[hsl(17,12%,6%)] mb-1">{host.title}</h3>
                    )}
                    <p className="text-gray-600 mb-3">
                      {host.firstName && host.lastName
                        ? `${host.firstName} ${host.lastName}`
                        : host.email}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[hsl(188,80%,95%)] text-[hsl(188,80%,42%)] hover:bg-[hsl(188,80%,90%)]">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t('home.verified')}
                      </Badge>
                      {isAISearch && (host as SearchResult).relevance && (host as SearchResult).relevance! > 0.7 && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {Math.round((host as SearchResult).relevance! * 100)}{t('hosts.relevant')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {host.countryCode && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-[hsl(188,100%,38%)]" />
                        <span>{countries.find((c: Country) => c.code === host.countryCode)?.name || host.countryCode}</span>
                      </div>
                    )}

                    {/* Purpose/Categories */}
                    {host.purpose && Array.isArray(host.purpose) && host.purpose.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700 text-sm font-medium">
                          <span>Categorías:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {host.purpose.map((purpose: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              {purpose}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video Call Topics */}
                    {host.videoCallTopics && Array.isArray(host.videoCallTopics) && host.videoCallTopics.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700 text-sm font-medium">
                          <span>{t('userProfile.videoCallTopics')}:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {host.videoCallTopics.slice(0, 3).map((topic: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                              {topic}
                            </Badge>
                          ))}
                          {host.videoCallTopics.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                            >
                              +{host.videoCallTopics.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-md p-2 text-white text-center">
                        <div className="text-lg font-bold">150+</div>
                        <div className="text-xs opacity-90">Sesiones</div>
                      </div>
                      <div className="bg-gradient-to-br from-[hsl(188,100%,45%)] to-[hsl(188,100%,35%)] rounded-md p-2 text-white text-center">
                        <div className="text-lg font-bold">98%</div>
                        <div className="text-xs opacity-90">Satisfacción</div>
                      </div>
                    </div>


                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hosts found
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                Tell us which host you are looking for
              </p>
            </div>
            <Button
              className="bg-[hsl(188,100%,38%)] hover:bg-[hsl(188,100%,32%)] text-white px-6 py-3"
              onClick={() => navigate('/request-host')}
            >
              Request a Host
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}