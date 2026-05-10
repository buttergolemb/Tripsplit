import svgPaths from "./svg-z7jlt4jrl4";

function Paragraph() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[22.5px] left-0 not-italic text-[#8e8e93] text-[15px] top-[-1.28px] whitespace-nowrap">Good evening</p>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[40.802px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[40.8px] left-0 not-italic text-[#1c1c1e] text-[34px] top-[-0.86px] tracking-[-0.85px] whitespace-nowrap">Your Trips</p>
    </div>
  );
}

function Title() {
  return (
    <div className="h-[131.289px] relative shrink-0 w-full" data-name="Title">
      <div className="content-stretch flex flex-col gap-[3.997px] items-start pt-[55.995px] px-[23.994px] relative size-full">
        <Paragraph />
        <Heading />
      </div>
    </div>
  );
}

function Container1() {
  return <div className="bg-gradient-to-r from-[#34c759] h-[2.988px] shrink-0 to-[rgba(52,199,89,0.3)] w-full" data-name="Container" />;
}

function Container5() {
  return (
    <div className="bg-[#f7f7f5] relative rounded-[14px] shrink-0 size-[43.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[33px] not-italic relative shrink-0 text-[#1c1c1e] text-[22px] whitespace-nowrap">📍</p>
      </div>
    </div>
  );
}

function H() {
  return (
    <div className="h-[23.377px] relative shrink-0 w-full" data-name="h3">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[23.375px] left-0 not-italic text-[#1c1c1e] text-[17px] top-[-0.18px] whitespace-nowrap">Austin Trip</p>
    </div>
  );
}

function Calendar() {
  return (
    <div className="relative shrink-0 size-[10.992px]" data-name="Calendar">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.9925 10.9925">
        <g clipPath="url(#clip0_2091_324)" id="Calendar">
          <path d="M3.66416 0.916039V2.74812" id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916039" />
          <path d="M7.32831 0.916039V2.74812" id="Vector_2" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916039" />
          <path d={svgPaths.p28807680} id="Vector_3" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916039" />
          <path d="M1.37406 4.5802H9.61841" id="Vector_4" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.916039" />
        </g>
        <defs>
          <clipPath id="clip0_2091_324">
            <rect fill="white" height="10.9925" width="10.9925" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function P() {
  return (
    <div className="flex-[1_0_0] h-[18.002px] min-w-px relative" data-name="p">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] whitespace-nowrap">Mar 15–18, 2026</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[3.996px] h-[18.002px] items-center relative shrink-0 w-full" data-name="Container">
      <Calendar />
      <P />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[43.37px] relative shrink-0 w-[106.937px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.992px] items-start relative size-full">
        <H />
        <Container7 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[43.995px] relative shrink-0 w-[164.925px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[13.993px] items-center relative size-full">
        <Container5 />
        <Container6 />
      </div>
    </div>
  );
}

function Text() {
  return <div className="absolute bg-[#34c759] left-[10px] opacity-50 rounded-[27417100px] size-[4.992px] top-[10.75px]" data-name="Text" />;
}

function Span() {
  return (
    <div className="bg-[#e8f7ee] h-[26.492px] relative rounded-[27417100px] shrink-0 w-[66.389px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text />
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] left-[20.98px] not-italic text-[#34c759] text-[11px] top-[5.63px] tracking-[0.275px] whitespace-nowrap">Active</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[43.995px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative size-full">
        <Container4 />
        <Span />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute bg-[#eaf2ff] content-stretch flex items-center justify-center left-0 rounded-[27417100px] shadow-[0px_0px_0px_0px_white] size-[23.989px] top-0" data-name="Container">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.68px] not-italic relative shrink-0 text-[#007aff] text-[9.12px] whitespace-nowrap">JM</p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute bg-[#e8f7ee] content-stretch flex items-center justify-center left-[18px] rounded-[27417100px] shadow-[0px_0px_0px_0px_white] size-[23.989px] top-0" data-name="Container">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.68px] not-italic relative shrink-0 text-[#34c759] text-[9.12px] whitespace-nowrap">SL</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bg-[#fff3e0] content-stretch flex items-center justify-center left-[36px] rounded-[27417100px] shadow-[0px_0px_0px_0px_white] size-[23.989px] top-0" data-name="Container">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.68px] not-italic relative shrink-0 text-[#ff9f0a] text-[9.12px] whitespace-nowrap">CT</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute bg-[#f1eeff] content-stretch flex items-center justify-center left-[54px] rounded-[27417100px] shadow-[0px_0px_0px_0px_white] size-[23.989px] top-0" data-name="Container">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[13.68px] not-italic relative shrink-0 text-[#8e8efa] text-[9.12px] whitespace-nowrap">MR</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute bg-[#f1f2f5] content-stretch flex items-center justify-center left-[72.01px] rounded-[27417100px] shadow-[0px_0px_0px_0px_white] size-[23.989px] top-0" data-name="Container">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[12.24px] not-italic relative shrink-0 text-[#8e8e93] text-[8.16px] whitespace-nowrap">+2</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="flex-[1_0_0] h-[23.989px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container12 />
        <Container13 />
        <Container14 />
        <Container15 />
        <Container16 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-[95.996px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center relative size-full">
        <Container11 />
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[18.002px] relative shrink-0 w-[49.6px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#8e8e93] text-[12px] top-[0.63px] whitespace-nowrap">6 people</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-[153.588px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.992px] items-center relative size-full">
        <Container10 />
        <Span1 />
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[15.997px]" data-name="ChevronRight">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9972 15.9972">
        <g id="ChevronRight">
          <path d={svgPaths.pe355500} id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3331" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container9 />
          <ChevronRight />
        </div>
      </div>
    </div>
  );
}

function DollarSign() {
  return (
    <div className="relative shrink-0 size-[13.993px]" data-name="DollarSign">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9927 13.9927">
        <g clipPath="url(#clip0_2091_320)" id="DollarSign">
          <path d="M6.99637 1.16606V12.8267" id="Vector" stroke="var(--stroke-0, #FF2D55)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16606" />
          <path d={svgPaths.p23a0f040} id="Vector_2" stroke="var(--stroke-0, #FF2D55)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16606" />
        </g>
        <defs>
          <clipPath id="clip0_2091_320">
            <rect fill="white" height="13.9927" width="13.9927" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-[#ffe8ef] relative rounded-[9px] shrink-0 size-[29.99px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.013px] relative size-full">
        <DollarSign />
      </div>
    </div>
  );
}

function P1() {
  return (
    <div className="h-[19.495px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[0] left-0 not-italic text-[#1c1c1e] text-[13px] top-[0.63px] whitespace-nowrap">
        <span className="leading-[19.5px]">{`You Spent `}</span>
        <span className="leading-[19.5px] text-[#ff2d55]">$36</span>
      </p>
    </div>
  );
}

function P2() {
  return (
    <div className="h-[16.508px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#8e8e93] text-[11px] top-[0.63px] whitespace-nowrap">4 expenses added today</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[36.999px] relative shrink-0 w-[128.041px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[0.996px] items-start relative size-full">
        <P1 />
        <P2 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex gap-[7.992px] h-[36.999px] items-center relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container20 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[12.805px] relative shrink-0 w-[331.109px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f1f2f5] border-solid border-t-[0.817px] inset-0 pointer-events-none" />
      <Container18 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[193.958px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[15.997px] items-start pt-[19.993px] px-[19.993px] relative size-full">
        <Container3 />
        <Container8 />
        <Container17 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[196.945px] items-start overflow-clip relative rounded-[22px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.04)] shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[#f7f7f5] relative rounded-[14px] shrink-0 size-[43.992px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[33px] not-italic relative shrink-0 text-[#1c1c1e] text-[22px] whitespace-nowrap">🏖️</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex h-[21.235px] items-start relative shrink-0 w-full" data-name="Heading 3">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[21.25px] not-italic relative shrink-0 text-[#1c1c1e] text-[17px] whitespace-nowrap">Beach Weekend</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[19.499px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[-0.14px] whitespace-nowrap">Apr 5-7, 2026</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="flex-[1_0_0] h-[42.727px] min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.992px] items-start relative size-full">
        <Heading1 />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[43.992px] relative shrink-0 w-[189.37px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[13.995px] items-center relative size-full">
        <Container23 />
        <Container24 />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="bg-[#eaf2ff] h-[24.479px] relative rounded-[28899100px] shrink-0 w-[68.443px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] left-[10px] not-italic text-[#007aff] text-[11px] top-[4.72px] tracking-[0.275px] whitespace-nowrap">Planning</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[43.992px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative size-full">
        <Container22 />
        <Text1 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[11.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9904 11.9904">
        <g clipPath="url(#clip0_2091_304)" id="Icon">
          <path d={svgPaths.p16728900} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.p1d63a600} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pab0ee80} id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pd7f5300} id="Vector_4" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
        </g>
        <defs>
          <clipPath id="clip0_2091_304">
            <rect fill="white" height="11.9904" width="11.9904" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute bg-[#e5e5ea] content-stretch flex items-center justify-center left-0 rounded-[28899100px] shadow-[0px_0px_0px_0px_white] size-[23.994px] top-0" data-name="Container">
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[11.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9904 11.9904">
        <g clipPath="url(#clip0_2091_304)" id="Icon">
          <path d={svgPaths.p16728900} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.p1d63a600} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pab0ee80} id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pd7f5300} id="Vector_4" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
        </g>
        <defs>
          <clipPath id="clip0_2091_304">
            <rect fill="white" height="11.9904" width="11.9904" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute bg-[#e5e5ea] content-stretch flex items-center justify-center left-[18.01px] rounded-[28899100px] shadow-[0px_0px_0px_0px_white] size-[23.994px] top-0" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[11.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9904 11.9904">
        <g clipPath="url(#clip0_2091_304)" id="Icon">
          <path d={svgPaths.p16728900} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.p1d63a600} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pab0ee80} id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pd7f5300} id="Vector_4" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
        </g>
        <defs>
          <clipPath id="clip0_2091_304">
            <rect fill="white" height="11.9904" width="11.9904" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute bg-[#e5e5ea] content-stretch flex items-center justify-center left-[36.01px] rounded-[28899100px] shadow-[0px_0px_0px_0px_white] size-[23.994px] top-0" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[11.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9904 11.9904">
        <g clipPath="url(#clip0_2091_304)" id="Icon">
          <path d={svgPaths.p16728900} id="Vector" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.p1d63a600} id="Vector_2" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pab0ee80} id="Vector_3" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
          <path d={svgPaths.pd7f5300} id="Vector_4" stroke="var(--stroke-0, #8E8E93)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999198" />
        </g>
        <defs>
          <clipPath id="clip0_2091_304">
            <rect fill="white" height="11.9904" width="11.9904" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute bg-[#e5e5ea] content-stretch flex items-center justify-center left-[54.02px] rounded-[28899100px] shadow-[0px_0px_0px_0px_white] size-[23.994px] top-0" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-[78.011px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container28 />
        <Container29 />
        <Container30 />
        <Container31 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="flex-[1_0_0] h-[19.499px] min-w-px relative" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[-0.14px] whitespace-nowrap">4 people committed</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-[209.986px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.994px] items-center relative size-full">
        <Container27 />
        <Text2 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[15.987px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9872 15.9872">
        <g id="Icon">
          <path d={svgPaths.p130a4c00} id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33226" />
        </g>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container26 />
          <Icon4 />
        </div>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-white h-[123.968px] relative rounded-[22px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04),0px_4px_12px_0px_rgba(0,0,0,0.04)] shrink-0 w-full" data-name="Link">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[15.987px] items-start pt-[19.997px] px-[19.997px] relative size-full">
          <Container21 />
          <Container25 />
        </div>
      </div>
    </div>
  );
}

function Trips() {
  return (
    <div className="content-stretch flex flex-col gap-[11.99px] h-[320.739px] items-start relative shrink-0 w-[371.096px]" data-name="Trips">
      <Container />
      <Link />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[18.194px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[18.2px] left-[7.99px] not-italic text-[#8e8e93] text-[13px] top-[-0.14px] tracking-[0.65px] uppercase whitespace-nowrap">Past Trips</p>
    </div>
  );
}

function Db1() {
  return (
    <div className="bg-[#f7f7f5] relative rounded-[12px] shrink-0 size-[39.995px]" data-name="db">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[28px] not-italic relative shrink-0 text-[#1c1c1e] text-[18px] whitespace-nowrap">⛰️</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[21.007px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#1c1c1e] text-[15px] top-[-1.14px] whitespace-nowrap">Mountain Cabin</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[19.499px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[19.5px] left-0 not-italic text-[#8e8e93] text-[13px] top-[-0.14px] whitespace-nowrap">Feb 10-12, 2026 · All settled ✓</p>
    </div>
  );
}

function Db2() {
  return (
    <div className="flex-[1_0_0] h-[40.506px] min-w-px relative" data-name="db">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Heading3 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[15.987px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9872 15.9872">
        <g id="Icon">
          <path d={svgPaths.p130a4c00} id="Vector" stroke="var(--stroke-0, #C7C7CC)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33226" />
        </g>
      </svg>
    </div>
  );
}

function Link1() {
  return (
    <div className="bg-[rgba(255,255,255,0.6)] h-[72.481px] relative rounded-[18px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.03)] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[13.995px] items-center px-[15.987px] relative size-full">
          <Db1 />
          <Db2 />
          <Icon5 />
        </div>
      </div>
    </div>
  );
}

function PastTrips() {
  return (
    <div className="h-[230.657px] relative shrink-0 w-full" data-name="Past Trips">
      <div className="content-stretch flex flex-col gap-[11.99px] items-start px-[15.987px] relative size-full">
        <Heading2 />
        <Link1 />
      </div>
    </div>
  );
}

function Db() {
  return (
    <div className="absolute bg-[#f7f7f5] content-stretch flex flex-col gap-[24px] items-center left-0 top-0 w-[403.07px]" data-name="db">
      <Title />
      <Trips />
      <PastTrips />
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute left-[15.99px] size-[27.991px] top-[15.99px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.991 27.991">
        <g id="Icon">
          <path d="M5.83146 13.9955H22.1595" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33258" />
          <path d="M13.9955 5.83146V22.1595" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.33258" />
        </g>
      </svg>
    </div>
  );
}

function AddButton() {
  return (
    <div className="absolute bg-[#007aff] left-[319.11px] rounded-[28899100px] shadow-[0px_6px_20px_0px_rgba(0,122,255,0.35)] size-[59.965px] top-[782.23px]" data-name="Add Button">
      <Icon6 />
    </div>
  );
}

export default function YourTripsHomeScreen() {
  return (
    <div className="bg-white relative size-full" data-name="YourTrips_HomeScreen">
      <Db />
      <AddButton />
    </div>
  );
}