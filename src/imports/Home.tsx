import svgPaths from "./svg-bp6ncbwjph";

function Time() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Time">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pl-[16px] pr-[6px] relative w-full">
          <p className="font-['SF_Pro:Semibold',sans-serif] font-[590] leading-[22px] relative shrink-0 text-[17px] text-black text-center" style={{ fontVariationSettings: "\'wdth\' 100" }}>
            9:41
          </p>
        </div>
      </div>
    </div>
  );
}

function DynamicIslandSpacer() {
  return <div className="h-[10px] shrink-0 w-[124px]" data-name="Dynamic Island spacer" />;
}

function Battery() {
  return (
    <div className="h-[13px] relative shrink-0 w-[27.328px]" data-name="Battery">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27.328 13">
        <g id="Battery">
          <rect height="12" id="Border" opacity="0.35" rx="3.8" stroke="var(--stroke-0, black)" width="24" x="0.5" y="0.5" />
          <path d={svgPaths.p3bbd9700} fill="var(--fill-0, black)" id="Cap" opacity="0.4" />
          <rect fill="var(--fill-0, black)" height="9" id="Capacity" rx="2.5" width="21" x="2" y="2" />
        </g>
      </svg>
    </div>
  );
}

function Levels() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Levels">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[7px] items-center justify-center pl-[6px] pr-[16px] relative w-full">
          <div className="h-[12.226px] relative shrink-0 w-[19.2px]" data-name="Cellular Connection">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.2 12.2264">
              <path clipRule="evenodd" d={svgPaths.p1e09e400} fill="var(--fill-0, black)" fillRule="evenodd" id="Cellular Connection" />
            </svg>
          </div>
          <div className="h-[12.328px] relative shrink-0 w-[17.142px]" data-name="Wifi">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.1417 12.3283">
              <path clipRule="evenodd" d={svgPaths.p18b35300} fill="var(--fill-0, black)" fillRule="evenodd" id="Wifi" />
            </svg>
          </div>
          <Battery />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Frame">
      <Time />
      <DynamicIslandSpacer />
      <Levels />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col h-[76px] items-start left-1/2 pt-[21px] top-0 w-[393px]" data-name="Status Bar">
      <Frame />
    </div>
  );
}

function Frame13() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[16px] relative w-full">
          <p className="flex-[1_0_0] font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-[normal] min-h-px min-w-px relative text-[28px] text-black whitespace-pre-wrap">📍Austin Trip</p>
        </div>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[4px] items-start leading-[normal] px-[16px] relative text-black w-full whitespace-pre-wrap">
        <p className="font-['Plus_Jakarta_Sans:Light_Italic',sans-serif] font-light italic relative shrink-0 text-[14px] w-[361px]">Total Needed for the Trip:</p>
        <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold min-w-full relative shrink-0 text-[40px] w-[min-content]">{`$1490 Left `}</p>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Frame13 />
      <Frame21 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end justify-end min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none relative shrink-0 text-[#d32f2f] text-[20px] tracking-[-1px]">$1200</p>
      <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[14.4px] relative shrink-0 text-[#757575] text-[12px] tracking-[-0.5px]">left</p>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 text-center w-full">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[1.3] relative shrink-0 text-[#333] text-[14px]">Airbnb</p>
      <Frame2 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start justify-end relative shrink-0 w-full">
      <Frame8 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] h-[49px] items-start justify-center min-h-px min-w-px relative">
      <Frame1 />
      <div className="content-stretch flex items-baseline overflow-clip relative shrink-0 w-[279px]" data-name="Progress Bar">
        <div className="bg-gradient-to-r flex-[1_0_0] from-[#a5d6a7] h-[5px] min-h-px min-w-px to-[#66bb6a]" />
        <div className="bg-[#333] h-[5px] shrink-0 w-[187px]" />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[14.4px] relative shrink-0 text-[32px] text-black text-center tracking-[-0.5px]">🏠</p>
      <Frame5 />
      <div className="flex items-center justify-center relative shrink-0 size-[18px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="overflow-clip relative size-[18px]" data-name="ChevronDown">
            <div className="absolute inset-[33.41%_22.43%_33.34%_22.22%]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.96296 5.98633">
                <path d={svgPaths.p1538480} fill="var(--fill-0, black)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end justify-end min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none relative shrink-0 text-[#d32f2f] text-[20px] tracking-[-1px]">$90</p>
      <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[14.4px] relative shrink-0 text-[#757575] text-[12px] tracking-[-0.5px]">left</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 text-center w-full">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[1.3] relative shrink-0 text-[#333] text-[14px]">Gas Money</p>
      <Frame14 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col items-start justify-end relative shrink-0 w-full">
      <Frame11 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] h-[49px] items-start justify-center min-h-px min-w-px relative">
      <Frame9 />
      <div className="content-stretch flex items-baseline overflow-clip relative shrink-0 w-[279px]" data-name="Progress Bar">
        <div className="bg-gradient-to-r flex-[1_0_0] from-[#a5d6a7] h-[5px] min-h-px min-w-px to-[#66bb6a]" />
        <div className="bg-[#333] h-[5px] shrink-0 w-[187px]" />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[14.4px] relative shrink-0 text-[32px] text-black text-center tracking-[-0.5px]">⛽</p>
      <Frame6 />
      <div className="flex items-center justify-center relative shrink-0 size-[18px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="overflow-clip relative size-[18px]" data-name="ChevronDown">
            <div className="absolute inset-[33.41%_22.43%_33.34%_22.22%]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.96296 5.98633">
                <path d={svgPaths.p1538480} fill="var(--fill-0, black)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-end justify-end min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none relative shrink-0 text-[#d32f2f] text-[20px] tracking-[-1px]">$200</p>
      <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[14.4px] relative shrink-0 text-[#757575] text-[12px] tracking-[-0.5px]">left</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 text-center w-full">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[1.3] relative shrink-0 text-[#333] text-[14px]">Food</p>
      <Frame19 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex flex-col items-start justify-end relative shrink-0 w-full">
      <Frame18 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] h-[49px] items-start justify-center min-h-px min-w-px relative">
      <Frame17 />
      <div className="content-stretch flex items-baseline overflow-clip relative shrink-0 w-[279px]" data-name="Progress Bar">
        <div className="bg-gradient-to-r flex-[1_0_0] from-[#a5d6a7] h-[5px] min-h-px min-w-px to-[#66bb6a]" />
        <div className="bg-[#333] h-[5px] shrink-0 w-[187px]" />
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[14.4px] relative shrink-0 text-[32px] text-black text-center tracking-[-0.5px]">🍽</p>
      <Frame16 />
      <div className="flex items-center justify-center relative shrink-0 size-[18px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="overflow-clip relative size-[18px]" data-name="ChevronDown">
            <div className="absolute inset-[33.41%_22.43%_33.34%_22.22%]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.96296 5.98633">
                <path d={svgPaths.p1538480} fill="var(--fill-0, black)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame30() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-end justify-end min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none relative shrink-0 text-[#66bb6a] text-[20px] text-center tracking-[-1px]">Paid</p>
    </div>
  );
}

function Frame29() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[1.3] relative shrink-0 text-[#333] text-[14px] text-center">Activities</p>
      <Frame30 />
    </div>
  );
}

function Frame28() {
  return (
    <div className="content-stretch flex flex-col items-start justify-end relative shrink-0 w-full">
      <Frame29 />
    </div>
  );
}

function Frame27() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] h-[49px] items-start justify-center min-h-px min-w-px relative">
      <Frame28 />
      <div className="content-stretch flex items-baseline overflow-clip relative shrink-0 w-[279px]" data-name="Progress Bar">
        <div className="bg-gradient-to-r from-[#a5d6a7] h-[5px] shrink-0 to-[#66bb6a] w-[279px]" />
        <div className="bg-[#333] h-[5px] shrink-0 w-[187px]" />
      </div>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal leading-[14.4px] relative shrink-0 text-[32px] text-black text-center tracking-[-0.5px]">🎟️</p>
      <Frame27 />
      <div className="flex items-center justify-center relative shrink-0 size-[18px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="overflow-clip relative size-[18px]" data-name="ChevronDown">
            <div className="absolute inset-[33.41%_22.43%_33.34%_22.22%]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.96296 5.98633">
                <path d={svgPaths.p1538480} fill="var(--fill-0, black)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame35() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-end justify-end min-h-px min-w-px relative">
      <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none relative shrink-0 text-[#66bb6a] text-[20px] text-center tracking-[-1px]">Paid</p>
    </div>
  );
}

function Frame34() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[1.3] relative shrink-0 text-[#333] text-[14px] text-center">Groceries and snacks</p>
      <Frame35 />
    </div>
  );
}

function Frame33() {
  return (
    <div className="content-stretch flex flex-col items-start justify-end relative shrink-0 w-full">
      <Frame34 />
    </div>
  );
}

function Frame32() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] h-[49px] items-start justify-center min-h-px min-w-px relative">
      <Frame33 />
      <div className="content-stretch flex items-baseline overflow-clip relative shrink-0 w-[279px]" data-name="Progress Bar">
        <div className="bg-gradient-to-r from-[#a5d6a7] h-[5px] shrink-0 to-[#66bb6a] w-[279px]" />
        <div className="bg-[#333] h-[5px] shrink-0 w-[187px]" />
      </div>
    </div>
  );
}

function Frame31() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal h-[15px] justify-center leading-[0] relative shrink-0 text-[32px] text-black text-center tracking-[-0.5px] w-[32px]">
        <p className="leading-[14.4px] whitespace-pre-wrap">{` 🛒`}</p>
      </div>
      <Frame32 />
      <div className="flex items-center justify-center relative shrink-0 size-[18px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "21.59375" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <div className="overflow-clip relative size-[18px]" data-name="ChevronDown">
            <div className="absolute inset-[33.41%_22.43%_33.34%_22.22%]" data-name="Vector">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.96296 5.98633">
                <path d={svgPaths.p1538480} fill="var(--fill-0, black)" id="Vector" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="bg-[#fafafa] content-stretch flex flex-col gap-[10px] items-start py-[12px] relative rounded-[8px] shrink-0 w-full">
      <div className="bg-[#f5f5f5] content-start flex flex-wrap gap-y-[10px] items-start overflow-clip px-[8px] py-[10px] relative rounded-[8px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[361px]" data-name="Expensive">
        <Frame3 />
      </div>
      <div className="bg-[#f5f5f5] content-start flex flex-wrap gap-y-[10px] items-start overflow-clip px-[8px] py-[10px] relative rounded-[8px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[361px]">
        <Frame4 />
      </div>
      <div className="bg-[#f5f5f5] content-start flex flex-wrap gap-y-[10px] items-start overflow-clip px-[8px] py-[10px] relative rounded-[8px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[361px]">
        <Frame15 />
      </div>
      <div className="bg-[#f5f5f5] content-start flex flex-wrap gap-y-[10px] items-start overflow-clip px-[8px] py-[10px] relative rounded-[8px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[361px]">
        <Frame20 />
      </div>
      <div className="bg-[#f5f5f5] content-start flex flex-wrap gap-y-[10px] items-start overflow-clip px-[8px] py-[10px] relative rounded-[8px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[361px]">
        <Frame31 />
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full">
      <p className="font-['Plus_Jakarta_Sans:Light_Italic',sans-serif] font-light italic leading-[normal] relative shrink-0 text-[14px] text-black w-[361px] whitespace-pre-wrap">Amount Still Needed by Category:</p>
      <Frame25 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-white relative shrink-0 w-full">
      <div className="content-stretch flex flex-col gap-[10px] items-start px-[16px] relative w-full">
        <Frame26 />
        <div className="bg-[#f5f5f5] rounded-[8px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] shrink-0 sticky top-0 w-full" data-name="Add Expensive">
          <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex flex-col items-center px-[16px] py-[10px] relative w-full">
              <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[0] relative shrink-0 text-[#333] text-[15px]">
                <span className="leading-[normal]">{`+ Add `}</span>
                <span className="leading-[normal]">an</span>
                <span className="leading-[normal]">{` Expense`}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full">
      <Frame23 />
      <Frame7 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame24 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame10 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 top-[87px] w-[393px]">
      <Frame22 />
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white relative size-full" data-name="Home">
      <StatusBar />
      <Frame12 />
    </div>
  );
}