import { type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "motion/react";

const wiggleAnimation = {
  x: [0, 5, 0, 5, 0],
  rotate: [0, 10, 0, 10, 0],
  transition: {
    x: {
      duration: 0.6,
      ease: "easeInOut",
      loop: Infinity,
      delay: 1,
    },
    rotate: {
      duration: 0.6,
      ease: "easeInOut",
      loop: Infinity,
      delay: 1,
    },
  },
};
export function SlidingCard({
  children,
  next,
  key,
  wiggle,
}: {
  children: ReactNode;
  next: () => void;
  key: string | number;
  wiggle?: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);

  return (
    <motion.div
      key={key}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      drag
      style={{ x, rotate, width: "100%", position: "absolute" }}
      initial={{ scale: 0.8 }}
      animate={{
        scale: 1,
        transition: {
          duration: 0.4,
          type: "spring",
          bounce: 0.5,
        },
        ...(wiggle ? wiggleAnimation : {}),
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.2 },
      }}
      onDragEnd={(event, info) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;

        const rect = target.getBoundingClientRect();
        if (
          Math.abs(info.velocity.x) > rect.width * 0.35 ||
          Math.abs(info.offset.x) > rect.width * 0.6
        ) {
          x.set(x.get() * 4);
          x.stop();
          next();
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function SlidingCardsContainer({ children }: { children: ReactNode }) {
  return <AnimatePresence mode="popLayout">{children}</AnimatePresence>;
}
