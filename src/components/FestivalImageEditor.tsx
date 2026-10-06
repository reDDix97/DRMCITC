import React, { useRef, useState } from 'react';
import {
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Upload,
  X,
  Layers,
} from 'lucide-react';
import {
  BANNER_PRESETS,
  THUMBNAIL_PRESETS,
  processUploadedImage,
} from '../utils/imagePresets';
import { ResilientImage } from './QrCodeSvg';

interface FestivalImageEditorProps {
  coverImage: string;
  thumbnailImage?: string;
  festivalName?: string;
  onChange: (images: { coverImage: string; thumbnailImage?: string }) => void;
}

export const FestivalImageEditor: React.FC<FestivalImageEditorProps> = ({
  coverImage,
  thumbnailImage,
  festivalName = 'Festival Preview',
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'banner' | 'thumbnail'>('banner');
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const [thumbUrlInput, setThumbUrlInput] = useState('');
  const [useBannerAsThumbnail, setUseBannerAsThumbnail] = useState(
    !thumbnailImage || thumbnailImage === coverImage
  );
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const thumbFileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    try {
      setIsProcessingUpload(true);
      setUploadError(null);
      // Process and compress image for banner
      const dataUrl = await processUploadedImage(file, 1280, 720, 0.85);
      const newThumb = useBannerAsThumbnail ? dataUrl : thumbnailImage;
      onChange({ coverImage: dataUrl, thumbnailImage: newThumb });
    } catch {
      setUploadError('Failed to process image. Please try another file or URL.');
    } finally {
      setIsProcessingUpload(false);
      if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
    }
  };

  const handleThumbFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }

    try {
      setIsProcessingUpload(true);
      setUploadError(null);
      // Process and compress image for square thumbnail
      const dataUrl = await processUploadedImage(file, 480, 480, 0.88);
      setUseBannerAsThumbnail(false);
      onChange({ coverImage, thumbnailImage: dataUrl });
    } catch {
      setUploadError('Failed to process thumbnail file.');
    } finally {
      setIsProcessingUpload(false);
      if (thumbFileInputRef.current) thumbFileInputRef.current.value = '';
    }
  };

  const handleApplyBannerUrl = () => {
    const url = bannerUrlInput.trim();
    if (!url) return;
    const newThumb = useBannerAsThumbnail ? url : thumbnailImage;
    onChange({ coverImage: url, thumbnailImage: newThumb });
    setBannerUrlInput('');
  };

  const handleApplyThumbUrl = () => {
    const url = thumbUrlInput.trim();
    if (!url) return;
    setUseBannerAsThumbnail(false);
    onChange({ coverImage, thumbnailImage: url });
    setThumbUrlInput('');
  };

  const handleSelectBannerPreset = (dataUrl: string) => {
    const newThumb = useBannerAsThumbnail ? dataUrl : thumbnailImage;
    onChange({ coverImage: dataUrl, thumbnailImage: newThumb });
  };

  const handleSelectThumbPreset = (dataUrl: string) => {
    setUseBannerAsThumbnail(false);
    onChange({ coverImage, thumbnailImage: dataUrl });
  };

  const handleToggleUseBanner = (checked: boolean) => {
    setUseBannerAsThumbnail(checked);
    if (checked) {
      onChange({ coverImage, thumbnailImage: coverImage });
    }
  };

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-5">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h3 className="font-display text-sm font-bold text-zinc-950 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Festival Imagery & Branding</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Configure the 16:9 hero banner and compact 1:1 card thumbnail
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-200/80 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('banner')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'banner'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Banner (16:9)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('thumbnail')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'thumbnail'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Thumbnail (1:1)
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-500 hover:text-red-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BANNER TAB */}
      {activeTab === 'banner' && (
        <div className="space-y-4">
          {/* Live Preview Card */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span className="font-semibold">Current Banner Preview</span>
              <span className="font-mono text-[11px] text-zinc-400">Aspect 16:9 · Wide Hero</span>
            </div>

            <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 shadow-xs">
              <ResilientImage
                src={coverImage}
                alt={festivalName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-600/90 rounded text-white shadow-2xs">
                    Hero Display
                  </span>
                  <h4 className="font-display text-lg sm:text-xl font-bold mt-1 text-white drop-shadow-xs">
                    {festivalName}
                  </h4>
                </div>

                {thumbnailImage && thumbnailImage !== coverImage && (
                  <div className="w-12 h-12 rounded-lg border-2 border-white/80 overflow-hidden shadow-md shrink-0 bg-zinc-900">
                    <ResilientImage
                      src={thumbnailImage}
                      alt="Thumbnail badge"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Banner Input Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Option A: Upload from Computer */}
            <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Upload from Computer</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Choose any JPG, PNG, WebP, or SVG file.
                </p>
              </div>

              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerFileUpload}
                className="hidden"
                id="banner-file-input"
              />

              <button
                type="button"
                disabled={isProcessingUpload}
                onClick={() => bannerFileInputRef.current?.click()}
                className="w-full py-2 px-3 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 border border-zinc-200"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-600" />
                <span>{isProcessingUpload ? 'Optimizing image...' : 'Browse Local Image'}</span>
              </button>
            </div>

            {/* Option B: Enter Custom URL */}
            <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Image Web Link (URL)</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Paste any hosted image URL (HTTPS).
                </p>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={bannerUrlInput}
                  onChange={(e) => setBannerUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyBannerUrl();
                    }
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyBannerUrl}
                  disabled={!bannerUrlInput.trim()}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Option C: Curated Theme Presets */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Or Choose a High-Resolution Curated Preset</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BANNER_PRESETS.map((preset) => {
                const isSelected = coverImage === preset.dataUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectBannerPreset(preset.dataUrl)}
                    className={`relative rounded-xl overflow-hidden border text-left p-1.5 transition-all cursor-pointer group ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    <div className="aspect-16/9 rounded-lg overflow-hidden relative bg-zinc-950">
                      <ResilientImage
                        src={preset.dataUrl}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-zinc-800 mt-1 truncate px-0.5">
                      {preset.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* THUMBNAIL TAB */}
      {activeTab === 'thumbnail' && (
        <div className="space-y-4">
          {/* Synchronize checkbox */}
          <div className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-xs text-zinc-800 cursor-pointer font-medium select-none">
              <input
                type="checkbox"
                checked={useBannerAsThumbnail}
                onChange={(e) => handleToggleUseBanner(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-600"
              />
              <span>Use 16:9 Banner Image as default Thumbnail</span>
            </label>
            <span className="font-mono text-[10px] text-zinc-400">1:1 Aspect Recommended</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            {/* Live Preview Column */}
            <div className="sm:col-span-4 space-y-2">
              <p className="text-xs font-semibold text-zinc-700">Card Thumbnail Preview</p>
              <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-zinc-200 bg-zinc-950 relative shadow-xs">
                <ResilientImage
                  src={thumbnailImage || coverImage}
                  alt={festivalName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-black/70 text-zinc-200 rounded">
                    Card Badge
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Shown in directory filters, search results, and mobile listings.
              </p>
            </div>

            {/* Custom Thumbnail Controls */}
            <div className="sm:col-span-8 space-y-3">
              {useBannerAsThumbnail ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Synchronized with Banner</span>
                  </p>
                  <p className="text-blue-700 text-[11px]">
                    The festival is currently using the 16:9 banner graphic for its card thumbnail.
                    Uncheck the box above if you would like to upload a separate dedicated square
                    emblem or logo!
                  </p>
                  <button
                    type="button"
                    onClick={() => handleToggleUseBanner(false)}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    Set Separate Custom Thumbnail
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Upload Thumbnail */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-3 space-y-2 flex flex-col justify-between">
                      <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Upload Square Emblem</span>
                      </p>
                      <input
                        ref={thumbFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isProcessingUpload}
                        onClick={() => thumbFileInputRef.current?.click()}
                        className="w-full py-1.5 px-3 text-xs font-semibold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-lg cursor-pointer border border-zinc-200"
                      >
                        Browse File
                      </button>
                    </div>

                    {/* URL Thumbnail */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-3 space-y-2 flex flex-col justify-between">
                      <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Emblem Web Link</span>
                      </p>
                      <div className="flex gap-1.5">
                        <input
                          type="url"
                          value={thumbUrlInput}
                          onChange={(e) => setThumbUrlInput(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-2 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:outline-none focus:border-zinc-900"
                        />
                        <button
                          type="button"
                          onClick={handleApplyThumbUrl}
                          disabled={!thumbUrlInput.trim()}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 rounded-lg cursor-pointer"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Presets */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Select an Official Club Crest / Badge</span>
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {THUMBNAIL_PRESETS.map((preset) => {
                        const isSelected = thumbnailImage === preset.dataUrl;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectThumbPreset(preset.dataUrl)}
                            className={`aspect-square rounded-xl overflow-hidden border p-1 transition-all cursor-pointer relative ${
                              isSelected
                                ? 'border-blue-600 ring-2 ring-blue-600/30'
                                : 'border-zinc-200 hover:border-zinc-400 bg-white'
                            }`}
                            title={preset.name}
                          >
                            <ResilientImage
                              src={preset.dataUrl}
                              alt={preset.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
