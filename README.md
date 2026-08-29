> ye readme after project completion vapas likhi jayegi

## git workflow

# commands:-

- git clone `https://github.com/ARYAN0-work/PRAVEG.git`

- cd PRAVEG

- code .

- Whatever domain you are working on, create a folder for it

- open termianl and write => cd `the-folder-you-created`

- git checkout -b "branch-name"  `agar-branch vagera na samajh aaye toh apne ai se puchna ki kya command run kare bcz git switch command bhi hoti hai aur kabhi kho jao toh nhice vali command run kro`

git branch [for-seeing-on-which-branch-you-are-on]

`````bash

don't work on main directly problem hogi trust me 

`````

# for working on your branch

- jab tak koi functionality add nhi karlete tab tak commit nhi karna pra project mat sath me commit karna 

git add "file-name"

git commit -m "your message"

# after commiting completly 

git push -u origin `your-branch-name`

`````bash
never work on main directly even in future
`````

## extra questions [research karli thi]

- jisko joh language use karni hai voh kar lena koi problem nhi hai 

- manlo koi linux[wsl,opensuse,redhat] me work karta hai koi windows me koi mac me koi dikkat nhi

- manlo koi frontend npm use karta hai , backend pnpm and , ml pip use kar rha hai koi dikkat nhi

- frontend js me hai backend typescript me hai ml python me koi dikkat nhi 

## Team Rule

Before starting new work, always pull the latest `main`. matlab manlo tum kaam kar rhe ne bethe toh git pull karke dusro ka kamm add kar lena project me.

>koi bhi merge tab tak nhi hogi branch jab tak kaam complete nhi hoga alternative ek dusre ki branch access karo aur dusre ka kaam pull karo niche commands run kro 

`````bash
git fetch origin
git switch backend
git pull origin backend
`````

Do not work directly on `main` unless you are the repository maintainer.