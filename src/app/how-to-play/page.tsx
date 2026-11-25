import { HowToPlayContent } from "@/components/HowToPlayContent";
import { APP_NAME } from "@/lib/site";

export const metadata = {
  title: `遊び方 | ${APP_NAME}`,
  description: "空家サバイバルの遊び方・操作説明",
};

export default function HowToPlayPage() {
  return <HowToPlayContent />;
}
