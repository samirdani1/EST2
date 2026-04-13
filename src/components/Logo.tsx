export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/images/est-logo.png" 
        alt="EST Meknès" 
        className={`${className} w-auto object-contain`} 
      />
      <div className="flex flex-col justify-center">
        <span className="font-bold text-gray-900 leading-tight text-lg tracking-tight">EST Meknès</span>
        <span className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">TM - FBA</span>
      </div>
    </div>
  );
}
