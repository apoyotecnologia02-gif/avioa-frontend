
```
avioa-frontend
├─ app
│  ├─ (auth)
│  │  ├─ forgot-password
│  │  │  ├─ forgot-password-form.tsx
│  │  │  └─ page.tsx
│  │  ├─ invite
│  │  │  ├─ invite-form.tsx
│  │  │  └─ page.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  └─ send-forgot-password
│  │     ├─ page.tsx
│  │     └─ send-forgot-password.tsx
│  ├─ (portal)
│  │  ├─ admin
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ rewards
│  │  │  │  └─ page.tsx
│  │  │  └─ users
│  │  │     └─ page.tsx
│  │  ├─ dashboard
│  │  │  └─ page.tsx
│  │  ├─ forms
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ overtime
│  │  │  └─ page.tsx
│  │  ├─ points
│  │  │  ├─ history
│  │  │  │  └─ page.tsx
│  │  │  ├─ my-requests
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ points-request
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ page.tsx
│  │  └─ profile
│  │     ├─ page.tsx
│  │     └─ profile-form.tsx
│  ├─ api
│  │  ├─ admin
│  │  │  └─ users
│  │  │     ├─ leaders
│  │  │     │  └─ route.ts
│  │  │     ├─ route.ts
│  │  │     ├─ update-profile
│  │  │     │  └─ route.ts
│  │  │     └─ [userId]
│  │  │        ├─ resend-invite
│  │  │        │  └─ route.ts
│  │  │        └─ route.ts
│  │  ├─ auth
│  │  │  ├─ forgot-password
│  │  │  │  ├─ route.ts
│  │  │  │  └─ send
│  │  │  │     └─ route.ts
│  │  │  ├─ invite
│  │  │  │  ├─ accept
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ validate
│  │  │  │     └─ route.ts
│  │  │  └─ login
│  │  │     └─ route.ts
│  │  ├─ forms
│  │  │  ├─ route.ts
│  │  │  └─ [id]
│  │  │     ├─ route.ts
│  │  │     └─ submit
│  │  │        └─ route.ts
│  │  ├─ overtime
│  │  │  ├─ route.ts
│  │  │  ├─ summary
│  │  │  │  └─ route.ts
│  │  │  ├─ team
│  │  │  │  └─ route.ts
│  │  │  └─ [id]
│  │  │     └─ review
│  │  │        └─ route.ts
│  │  └─ points
│  │     ├─ history
│  │     │  └─ route.ts
│  │     ├─ my-requests
│  │     │  └─ route.ts
│  │     ├─ pending
│  │     │  ├─ route.ts
│  │     │  └─ [id]
│  │     │     └─ route.ts
│  │     ├─ request
│  │     │  └─ route.ts
│  │     ├─ rewards
│  │     │  ├─ create
│  │     │  │  └─ bulk
│  │     │  │     └─ route.ts
│  │     │  ├─ delete
│  │     │  │  └─ [id]
│  │     │  │     └─ route.ts
│  │     │  └─ route.ts
│  │     ├─ wallet
│  │     │  └─ route.ts
│  │     └─ [id]
│  │        ├─ approve
│  │        │  └─ route.ts
│  │        └─ reject
│  │           └─ route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components
│  ├─ forms
│  │  ├─ DynamicForm.tsx
│  │  └─ EmbeddedForm.tsx
│  ├─ layout
│  │  ├─ AppShell.tsx
│  │  ├─ Header.tsx
│  │  └─ Sidebar.tsx
│  ├─ overtime
│  │  ├─ OvertimeCalendar.tsx
│  │  ├─ OvertimeDayPanel.tsx
│  │  ├─ OvertimeStatusBadge.tsx
│  │  ├─ OvertimeSummaryCards.tsx
│  │  ├─ RegisterOvertimeModal.tsx
│  │  └─ ReviewOvertimeModal.tsx
│  ├─ points
│  │  ├─ PointsSummary.tsx
│  │  ├─ RequestPointsModal.tsx
│  │  ├─ RewardCard.tsx
│  │  └─ RewardsGrid.tsx
│  ├─ providers
│  │  └─ SocketProvider.tsx
│  ├─ providers.tsx
│  ├─ theme-provider.tsx
│  └─ ui
│     ├─ accordion.tsx
│     ├─ alert-dialog.tsx
│     ├─ alert.tsx
│     ├─ aspect-ratio.tsx
│     ├─ avatar.tsx
│     ├─ badge.tsx
│     ├─ breadcrumb.tsx
│     ├─ button-group.tsx
│     ├─ button.tsx
│     ├─ calendar.tsx
│     ├─ card.tsx
│     ├─ carousel.tsx
│     ├─ chart.tsx
│     ├─ checkbox.tsx
│     ├─ collapsible.tsx
│     ├─ command.tsx
│     ├─ context-menu.tsx
│     ├─ dialog.tsx
│     ├─ drawer.tsx
│     ├─ dropdown-menu.tsx
│     ├─ empty.tsx
│     ├─ field.tsx
│     ├─ form.tsx
│     ├─ hover-card.tsx
│     ├─ input-group.tsx
│     ├─ input-otp.tsx
│     ├─ input.tsx
│     ├─ item.tsx
│     ├─ kbd.tsx
│     ├─ label.tsx
│     ├─ menubar.tsx
│     ├─ navigation-menu.tsx
│     ├─ pagination.tsx
│     ├─ popover.tsx
│     ├─ progress.tsx
│     ├─ radio-group.tsx
│     ├─ resizable.tsx
│     ├─ scroll-area.tsx
│     ├─ select.tsx
│     ├─ separator.tsx
│     ├─ sheet.tsx
│     ├─ sidebar.tsx
│     ├─ skeleton.tsx
│     ├─ slider.tsx
│     ├─ sonner.tsx
│     ├─ spinner.tsx
│     ├─ switch.tsx
│     ├─ table.tsx
│     ├─ tabs.tsx
│     ├─ textarea.tsx
│     ├─ toast.tsx
│     ├─ toaster.tsx
│     ├─ toggle-group.tsx
│     ├─ toggle.tsx
│     ├─ tooltip.tsx
│     ├─ use-mobile.tsx
│     └─ use-toast.ts
├─ components.json
├─ hooks
│  ├─ use-mobile.ts
│  ├─ use-toast.ts
│  ├─ useAuth.ts
│  ├─ useCreateOvertime.ts
│  ├─ useForms.ts
│  ├─ useGetLeaders.ts
│  ├─ useMyOvertime.ts
│  ├─ useOvertimeSummary.ts
│  ├─ usePendingRequests.ts
│  ├─ usePointRequest.ts
│  ├─ useReedemReward.ts
│  ├─ useRequestPoints.ts
│  ├─ useReviewOvertime.ts
│  ├─ useRewards.ts
│  ├─ useTeamOvertime.ts
│  └─ useWallet.ts
├─ lib
│  ├─ admin
│  │  └─ modules.ts
│  ├─ axios.ts
│  ├─ queryClient.ts
│  ├─ roles.ts
│  └─ utils.ts
├─ middleware.ts
├─ next-env.d.ts
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ apple-icon.png
│  ├─ avioa-logo.png
│  ├─ icon-dark-32x32.png
│  ├─ icon-light-32x32.png
│  ├─ icon.svg
│  ├─ placeholder-logo.png
│  ├─ placeholder-logo.svg
│  ├─ placeholder-user.jpg
│  ├─ placeholder.jpg
│  └─ placeholder.svg
├─ store
│  ├─ authStore.ts
│  └─ notificationStore.ts
├─ styles
│  └─ globals.css
├─ tsconfig.json
├─ tsconfig.tsbuildinfo
├─ types
│  ├─ auth.types.ts
│  ├─ form.types.ts
│  ├─ notification.types.ts
│  ├─ overtime.types.ts
│  ├─ points.types.ts
│  └─ user.types.ts
└─ utils
   ├─ parse-response-data.util.ts
   └─ points-achievements.ts

```