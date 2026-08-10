import { MoveUpRight, Cpu } from "lucide-react";
import Link from "next/link";

const HomePageAi = () => {
    return (
        <div className="max-md:hidden flex-center h-screen p-3">
            <div className="bg-white relative rounded-xl w-full flex flex-col items-center justify-between overflow-hidden h-full">
                <div className="h-[500px] w-full overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover object-bottom">
                        <source src="/ai-video.webm" type="video/webm" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-4">
                    <h1 className="text-[2rem] md:text-[3rem] text-center font-semibold max-md:mb-4">
                        VaultQuant AI Intelligence Engine
                    </h1>
                    <p className="px-2 md:px-0 w-full md:w-1/2 text-[.9rem] md:text-[1rem] text-center text-zinc-600">
                        Stop guessing why some trades succeed while others fail.
                        VaultQuant&apos;s multi-model AI pattern recognition identifies
                        hidden risk factors affecting your performance that might otherwise
                        go unnoticed.
                    </p>
                    <Link
                        href="/private/tradeAI"
                        className="w-full flex justify-center cursor-pointer mt-8">
                        <div className="relative group inline-block">
                            <div className="flex items-center gap-2 mb-2 text-[#3D3929] font-medium">
                                Get report <MoveUpRight className="w-[1rem]" />
                            </div>
                            <span className="absolute left-0 bottom-0 block h-[0.3px] w-0 bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
                        </div>
                    </Link>
                    <div className="w-full flex gap-2 items-center justify-center pt-16 md:pt-20">
                        <Cpu className="w-5 h-5 text-amber-600" />
                        <h2 className="text-base md:text-lg text-zinc-700 font-medium">
                            Multi-Model AI Support (Claude, Gemini & GPT-4o)
                        </h2>
                    </div>
                </div>
                <div className="h-[500px] w-full overflow-hidden rotate-180">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="h-full w-full object-cover object-bottom">
                        <source src="/ai-video.webm" type="video/webm" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    );
};

export default HomePageAi;
