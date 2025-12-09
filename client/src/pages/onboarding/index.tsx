import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Globe, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Step 1: The "Identity Link"
const StepIdentity = ({ onNext, data, updateData }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="space-y-2 text-center">
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-purple-500/10 mb-4 border border-purple-500/20">
                    <ScanFace className="size-6 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Analicemos tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ADN Digital</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                    Pega el link de tu red social principal o web. Nuestra IA extraerá tu tono, estilo y audiencia en segundos.
                </p>
            </div>

            <div className="max-w-md mx-auto space-y-4 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="url" className="text-slate-300">Link de Instagram, TikTok o Web</Label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 size-5 text-slate-500" />
                        <Input
                            id="url"
                            className="pl-10 bg-white/5 border-white/10 text-white h-12 text-lg focus:border-purple-500/50 transition-all font-light"
                            placeholder="instagram.com/tu_marca"
                            value={data.url}
                            onChange={(e) => updateData({ url: e.target.value })}
                        />
                    </div>
                </div>

                <Button
                    onClick={onNext}
                    className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20"
                >
                    <Sparkles className="mr-2 size-5" />
                    Analizar Identidad
                </Button>
            </div>
        </motion.div>
    );
};

// Step 2: Voice Verification (Placeholder for AI Analysis Result)
const StepVoice = ({ onNext, onBack, data }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center"
        >
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                    Tu voz es <span className="italic text-purple-400">"Rebelde pero Educativa"</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-lg mx-auto">
                    Hemos detectado que usas humor sarcástico para explicar temas complejos. ¿Es correcto?
                </p>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10 max-w-lg mx-auto text-left space-y-4">
                <div className="flex gap-4 items-start">
                    <div className="bg-green-500/20 p-2 rounded text-green-400 text-xs font-mono">DETECTADO</div>
                    <div className="space-y-1">
                        <p className="text-white font-medium">Tono Directo</p>
                        <p className="text-sm text-slate-400">No usas rodeos. Vas al grano en los primeros 3 segundos.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="bg-blue-500/20 p-2 rounded text-blue-400 text-xs font-mono">DETECTADO</div>
                    <div className="space-y-1">
                        <p className="text-white font-medium">Audiencia: Gen Z / Young Millennials</p>
                        <p className="text-sm text-slate-400">Uso frecuente de jerga actual y formatos rápidos.</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 max-w-md mx-auto pt-4">
                <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5">
                    Ajustar Manualmente
                </Button>
                <Button onClick={onNext} className="flex-1 bg-white text-black hover:bg-slate-200">
                    Es Correcto <ArrowRight className="ml-2 size-4" />
                </Button>
            </div>
        </motion.div>
    )
}


export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ url: "", tone: "", pillars: [] });

    const updateData = (newData: any) => setData({ ...data, ...newData });
    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen bg-[#0A0A0D] flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-4xl relative z-10">
                <header className="flex justify-between items-center mb-12 px-4">
                    <div className="text-2xl font-bold tracking-tighter text-white">
                        virally<span className="text-purple-500">.ai</span>
                    </div>
                    <div className="text-slate-500 font-mono text-sm">
                        STEP {step} / 3
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {step === 1 && <StepIdentity key="step1" onNext={next} data={data} updateData={updateData} />}
                    {step === 2 && <StepVoice key="step2" onNext={next} onBack={back} data={data} />}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-white"
                        >
                            <h2 className="text-3xl font-bold mb-4">¡Todo listo!</h2>
                            <p className="text-slate-400 mb-8">Estamos configurando tu Workspace con esta personalidad.</p>
                            <Button className="bg-white text-black px-8 py-6 text-lg rounded-full hover:scale-105 transition-transform">
                                Ir al Dashboard
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
