'use client'

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
import Link from "next/link";

export default function AvatarMenu({ user, optionalComponentsClasses }: { user: NonNullable<DefaultSession['user']>, optionalComponentsClasses?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <HiOutlineLogout className="mr-2" />
          Sign out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={optionalComponentsClasses}>
          <Link href="/collections">
            My collections
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={optionalComponentsClasses}>
          <Link href="/create-collection">
            New collection
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu >
  )
}
