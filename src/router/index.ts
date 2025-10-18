import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import HomePage from '@/pages/home/HomePage.vue'
import LoginView from '@/pages/auth/LoginView.vue'
import RegisterView from '@/pages/auth/RegisterView.vue'
import DashboardLayout from '@/layouts/dashboard-layout/DashboardLayout.vue'
import LessonsPage from '@/pages/lessons/LessonsPage.vue'
import LettersPage from '@/pages/letters/LettersPage.vue'
import LessonDetailPage from '@/pages/lessons/LessonDetailPage.vue'
import ProfilePage from '@/pages/profile/ProfilePage.vue'
import LessonGroupsPage from '@/pages/lessons/LessonGroupsPage.vue'
import PracticePage from '@/pages/practice/PracticePage.vue'
import RandomCartoonPage from '@/pages/random-cartoon/RandomCartoonPage.vue'
import AdminLayout from '@/layouts/admin-layout/AdminLayout.vue'
import AdminPage from '@/pages/admin/AdminPage.vue'
import AdminCartoonsPage from '@/pages/admin/AdminCartoonsPage.vue'
import AdminLessonGroupsPage from '@/pages/admin/AdminLessonGroupsPage.vue'
import AdminLessonsPage from '@/pages/admin/AdminLessonsPage.vue'
import AdminLessonItemsPage from '@/pages/admin/AdminLessonItemsPage.vue'
import AdminPracticeItemsPage from '@/pages/admin/AdminPracticeItemsPage.vue'
import AdminStudentsPage from '@/pages/admin/AdminStudentsPage.vue'
import AdminTeachersPage from '@/pages/admin/AdminTeachersPage.vue'
import AdminAssignmentsPage from '@/pages/admin/AdminAssignmentsPage.vue'
import AssignmentsPage from '@/pages/assignments/AssignmentsPage.vue'
import NotFound from '@/pages/NotFound.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'cartoons',
        name: 'AdminCartoons',
        component: AdminCartoonsPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'lesson-groups',
        name: 'AdminLessonGroups',
        component: AdminLessonGroupsPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'lessons',
        name: 'AdminLessons',
        component: AdminLessonsPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'lesson-items',
        name: 'AdminLessonItems',
        component: AdminLessonItemsPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'practice-items',
        name: 'AdminPracticeItems',
        component: AdminPracticeItemsPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'students',
        name: 'AdminStudents',
        component: AdminStudentsPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'teachers',
        name: 'AdminTeachers',
        component: AdminTeachersPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'assignments',
        name: 'AdminAssignments',
        component: AdminAssignmentsPage,
        meta: { requiresAuth: true, requiresAdmin: true },
      },
    ],
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'lesson-groups',
        name: 'LessonGroups',
        component: LessonGroupsPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'lesson-groups/:id',
        name: 'Lessons',
        component: LessonsPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'lessons/:id',
        name: 'LessonDetail',
        component: LessonDetailPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'letters',
        name: 'Letters',
        component: LettersPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true },
      },
      {
        path: 'practice',
        name: 'Practice',
        component: PracticePage,
        meta: { requiresAuth: true },
      },
      {
        path: 'random-cartoon',
        name: 'RandomCartoon',
        component: RandomCartoonPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'assignments',
        name: 'Assignments',
        component: AssignmentsPage,
        meta: { requiresAuth: true },
      },
      {
        path: 'teacher',
        children: [
          {
            path: 'students',
            name: 'TeacherStudents',
            component: () => import('@/pages/teacher/TeacherStudents.vue'),
          },
          {
            path: 'lesson-groups',
            name: 'TeacherLessonGroups',
            component: () => import('@/pages/teacher/TeacherLessonGroups.vue'),
          },
          {
            path: 'lesson-groups/:groupId/lessons',
            name: 'TeacherLessons',
            component: () => import('@/pages/teacher/TeacherLessons.vue'),
            props: true,
          },
          {
            path: 'lesson-groups/:groupId/lessons/:lessonId/items',
            name: 'TeacherLessonItems',
            component: () => import('@/pages/teacher/TeacherLessonItems.vue'),
            props: true,
          },
          {
            path: 'assignments',
            name: 'TeacherAssignments',
            component: () => import('@/pages/teacher/TeacherAssignments.vue'),
            meta: { requiresAuth: true },
          },
        ],
      },
    ],
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _, next) => {
  const auth = useAuthStore()
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!auth.isAuthenticated()) {
      next({
        path: '/auth/login',
        query: { redirect: to.fullPath },
      })
    } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
      // Temporarily allow admin routes without redirect
      next()
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
