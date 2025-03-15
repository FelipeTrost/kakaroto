"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type DefaultSession } from "next-auth";
import { signOut } from "next-auth/react";
import { HiOutlineLogout } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "../ui/button";
import { deleteUser } from "@/server/db/user-actions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { isUserResponse } from "@/server/user-response";

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export default function AvatarMenu({
  user,
  optionalComponentsClasses,
}: {
  user: NonNullable<DefaultSession["user"]>;
  optionalComponentsClasses?: string;
}) {
  const { toast } = useToast();
  const router = useRouter();

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteAccount() {
    setDeleting(true);
    try {
      const res = await deleteUser();
      if (isUserResponse(res)) throw res;
      await signOut({ redirect: false });
      toast({ description: "Account deleted" });
      router.push("/");
    } catch (e) {
      if (isUserResponse(e))
        toast({
          title: "Error",
          description: e.message as string,
          variant: "destructive",
        });
    }

    setDeleting(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Collections</DropdownMenuLabel>
          <DropdownMenuItem asChild className={optionalComponentsClasses}>
            <Link href="/collections">My collections</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className={optionalComponentsClasses}>
            <Link href="/collections/new">New collection</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
          >
            <HiOutlineLogout className="mr-2" />
            Sign out
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteAccountOpen(true)}
          >
            <MdDelete className="mr-2" />
            Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={deleteAccountOpen}
        onOpenChange={(open) => setDeleteAccountOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and your collections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={async (e) => {
                e.preventDefault();
                await deleteAccount();
                setDeleteAccountOpen(false);
              }}
            >
              <LoadingSpinner
                className={cn([
                  "inline-flex h-4 w-4 transition-all duration-300",
                  { "mr-0 w-0 opacity-0": !deleting },
                  { "opacity-1 mr-2 w-full": deleting },
                ])}
              />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
