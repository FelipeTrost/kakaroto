import { motion } from "framer-motion";
import { type ComponentProps } from "react";

const divVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.5,
      type: "spring",
      stiffness: 120,
    },
  },
  exit: {
    opacity: 0,
    y: 50,
    rotateX: 15,
    transition: {
      duration: 0.3,
    },
  },
};

export default function BouncyDiv(
  props: ComponentProps<(typeof motion)["div"]>,
) {
  return (
    <motion.div
      variants={divVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      {...props}
    />
  );
}
