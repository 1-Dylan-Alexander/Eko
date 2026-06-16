export default function AppLoading() {
  return (
    <div className="p-8">
      <div className="border-b border-[#dddbd6] pb-6 mb-8">
        <div className="h-7 w-40 bg-[#e8e6e1] animate-pulse" />
        <div className="h-4 w-64 bg-[#e8e6e1] animate-pulse mt-2" />
      </div>
      <div className="space-y-3">
        <div className="h-24 bg-[#e8e6e1] animate-pulse" />
        <div className="h-24 bg-[#e8e6e1] animate-pulse opacity-70" />
        <div className="h-24 bg-[#e8e6e1] animate-pulse opacity-40" />
      </div>
    </div>
  )
}
