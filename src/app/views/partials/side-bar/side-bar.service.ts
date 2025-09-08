import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { link } from 'fs';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'Startup Weaver',
      menus: [
        {
          title: 'Dashboard',
          link: 'dashboard',
          icon: 'home',
        },
        {
          title: 'All Members',
          link: 'users',
          icon: 'users',
        },
        {
          title: 'OTP Records',
          link: 'otp',
          icon: 'key',
        },
        {
          title: 'User Management',
          icon: 'user-cog',
          hasSubmenu: true,
          submenu: [
            {
              title: 'Registration',
              link: 'registerComponent',
              icon: 'user-plus',
            },
            // {
            //   title: 'Conveted mobile User',
            //   link: 'applicationForm',
            //   icon: 'file-text',
            // },
            {
              title: 'Membership Form',
              link: 'application',
              icon: 'file-text',
            },
            {
              title: 'Import Users',
              link: 'importUsers',
              icon: 'file-import',
            },
          ]
        },
        {
          title: 'Add Events',
          link: 'events',
          icon: 'calendar',
        },
        // {
        //   title: ' Event And participation ',
        //   icon: 'calendar',
        //   hasSubmenu: true,
        //   submenu: [
        //     {
        //       title: 'Bardoli Event',
        //       link: 'registrationForm',
        //       icon: 'calendar-check',
        //     },
            
            
        //     {
        //       title: 'Participation',
        //       link: 'participation',
        //       icon: 'check-circle',
        //     },
        //     {
        //       title: 'Attendance',
        //       link: 'attendence',
        //       icon: 'check-square',
        //     },
        //   ]
        // },
        {
          title: 'Master Data',
          icon: 'settings',
          hasSubmenu: true,
          submenu: [
            {
              title: 'Countries',
              link: 'country',
              icon: 'globe',
            },  // {
            //   title: 'Chapters',
            //   link: 'chapter',
            //   icon: 'layers',
            // },
            {
              title: 'States',
              link: 'states',
              icon: 'map',
            },
            {
              title: 'Cities',
              link: 'city',
              icon: 'map-pin',
            },
          
            {
              title: 'Categories',
              link: 'category',
              icon: 'tag',
            },
            {
              title: 'Sessions',
              link: 'sessions',
              icon: 'play-circle',
            },
            {
              title: 'Session Requests',
              link: 'sessionRequests',
              icon: 'calendar-check',
            },
            {
              title: 'Videos',
              link: 'videos',
              icon: 'video',
            },
            {
              title: 'Batches',
              link: 'batch',
              icon: 'collection',
            },
            // {
            //   title: 'Sub Categories',
            //   link: 'subcategory',
            //   icon: 'list',
            // },
          ]
        },
        {
          title: 'Reports Sections',
          icon: 'file-text',
          hasSubmenu: true,
          submenu: [
            // {
            //   title: 'Referral Given Report',
            //   link: 'referralReport',
            //   icon: 'corner-up-right',
            // },
            // {
            //   title: 'Referral Received Report',
            //   link: 'referralReportRecieved',
            //   icon: 'corner-down-left',
            // },
            // {
            //   title: 'Testimonial Report',
            //   link: 'testimonialReport',
            //   icon: 'message-square',
            // },
            // {
            //   title: 'One To One Report',
            //   link: 'oneTooneReport',
            //   icon: 'user-check',
            // },
            // {
            //   title: 'TYFCB Report',
            //   link: 'tyfcb',
            //   icon: 'trending-up',
            // },
            // {
            //   title: 'Visitors Report',
            //   link: 'VisitorsReport',
            //   icon: 'user',
            // },
            // {
            //   title: 'Ask Management',
            //   link: 'askManagement',
            //   icon: 'question-circle',
            // },
            {
              title: 'Points History',
              link: 'pointHistory',
              icon: 'history',
            },
            {
              title: 'Attendance Record',
              link: 'attendanceRecord',
              icon: 'clipboard',
            },
            // {
            //   title: 'Fees Record',
            //   link: 'fees',
            //   icon: 'credit-card',
            // },
          ]
        },
        {
          title: 'Content Management',
          icon: 'layout',
          hasSubmenu: true,
          submenu: [
            {
              title: 'Banners',
              link: 'banners',
              icon: 'banner',
            },
            {
              title: 'Badges',
              link: 'badges',
              icon: 'award',
            },
            {
              title: 'Badge Management',
              link: 'badgeManagement',
              icon: 'cog',
            },
            {
              title: 'Training',
              link: 'podcasts',
              icon: 'podcast',
            },
            {
              title: 'Training Booking',
              link: 'podcastBooking',
              icon: 'calendar-check',
            },  
          ]
        },

        // {
        //   title: 'Finance',
        //   link: 'finance',
        //   icon: 'dollar-sign',
        // },
        // {
        //   title: 'Expense',
        //   link: 'expense',
        //   icon: 'credit-card',
        // },
        {
          title: 'Analytics',
          icon: 'bar-chart',
          hasSubmenu: true,
          submenu: [
            {
              title: 'LeaderBoard',
              link: 'leaderboard',
              icon: 'award',
            },
            {
              title: 'Analytics',
              link: 'analytics',
              icon: 'chart-bar',
            },
            {
              title: 'Attendance Data',
              link: 'attendanceRecord',
              icon: 'clipboard-list',
            },


          ]
        },
      //   {
      //   title:'Business Data',
      //   link:'LTPoints',
      //   icon:'history'
      // },
        {
        title:'Webinar',
        link:'webinar',
        icon:'history'
      },
        {
        title:'Webinar-Manage',
        link:'webinar-manage',
        icon:'history'
      },
        {
        title:'Goals',
        link:'goals',
        icon:'history'
      },
        {
        title:'Complain',
        link:'complain',
        icon:'compalins'
      },
        {
        title:'Suggestion',
        link:'suggestion',
        icon:'suggestion'
      },
      

        
      ],
    },
  ];

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }

  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}