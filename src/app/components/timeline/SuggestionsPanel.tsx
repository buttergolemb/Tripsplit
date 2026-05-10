import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MapPin, Plus, ChevronRight } from 'lucide-react';
import { HorizontalDragScroll } from '../HorizontalDragScroll';
import { Suggestion } from './types';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onPropose: (suggestion: Suggestion) => void;
  onSuggestionTap?: (suggestion: Suggestion) => void;
  className?: string;
}

export function SuggestionsPanel({ suggestions, onPropose, onSuggestionTap, className }: SuggestionsPanelProps) {
  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[#8E8EFA]">
          <Sparkles className="size-3.5" />
          <h3 className="text-[12px] font-semibold uppercase tracking-wider">Suggestions</h3>
        </div>
        <button className="text-[12px] text-[#8E8EFA] hover:text-[#6E6EDA] font-medium flex items-center gap-0.5">
          See all <ChevronRight className="size-3" />
        </button>
      </div>

      <HorizontalDragScroll className="flex overflow-x-auto pb-1 gap-2.5 no-scrollbar -mx-4 px-4">
        {suggestions.map((suggestion, index) => {
          const open = () => onSuggestionTap?.(suggestion);
          return (
            <motion.div
              key={suggestion.id}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={open}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open();
                }
              }}
              className="flex-shrink-0 w-[220px] bg-white rounded-[16px] p-3.5 shadow-[var(--shadow-apple-1)] hover:shadow-[var(--shadow-apple-2)] transition-all group cursor-pointer active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8E8EFA]/60"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{suggestion.emoji}</span>
                <button
                  type="button"
                  aria-label={`Add ${suggestion.title} to the timeline`}
                  // Both the card body and the `+` button open the same autofill tray,
                  // so we stop propagation here only to prevent the click from firing twice.
                  onClick={(e) => { e.stopPropagation(); onPropose(suggestion); }}
                  className="size-7 rounded-full bg-[#F1EEFF] text-[#8E8EFA] flex items-center justify-center hover:bg-[#E5DFFF] active:scale-90 transition-all"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <h4 className="text-[14px] font-semibold text-[#1C1C1E] mb-0.5 leading-snug line-clamp-2">{suggestion.title}</h4>
              <p className="text-[12px] text-[#8E8E93] mb-2">{suggestion.reason}</p>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#F1EEFF] text-[#8E8EFA] text-[10px] font-semibold uppercase tracking-wider rounded-md">
                  {suggestion.category}
                </span>
                {suggestion.distance && (
                  <span className="flex items-center gap-0.5 text-[10px] text-[#C7C7CC]">
                    <MapPin className="size-2.5" /> {suggestion.distance}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </HorizontalDragScroll>
    </div>
  );
}