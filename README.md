Effy Teva - Client Libraries

As a closed-source programmer, I've decided to share some of my recent client side modules.
All of these modules exist in many variations, however, after using most of the common existing solutions, and suffering from their issues / my special needs, I've re-built all of these modules from scratch.

All of these solutions are currently localized to Hebrew, yet they have minimal text and could be easily translated to English (or any other language). If you need my help with those translations, feel free to contact me at effyteva@gmail.com.

Most of these client-side modules were written for an Israeli start-up I'm leading, named OfficeGuy (www.myofficeguy.com). 
Also, all modules support both LTR (Left-to-right) and RTL (Right-to-left) layout natively, which is a huge issue for RTL developers...

In summary, the modules I publish for now are:
* Moveable - Similar to Gridster and jQuery UI draggable.
This module allows any elements in a container to move, without overlapping if needed.
See sample at: https://cdn.rawgit.com/effyteva/ClientLibraries/13a1fc6d4823610a847de814fc72f9eca9401100/Moveable/Moveable.htm

* Resizable - Similar to Grid (Resizable feature) and jQuery UI resizable.
This module allows any element to be resized, again, without overlapping if needed.
Combining Moveable and Resizable allowed a full switch from using Gridster on my project.
See sample at: https://cdn.rawgit.com/effyteva/ClientLibraries/13a1fc6d4823610a847de814fc72f9eca9401100/Resizable/Resizable.htm

* Sortable - Similiar to jQuery UI sortable.
This module allows easily sorting (drag and drop) table rows, or any other element, using a defined handle.
See sample at: https://cdn.rawgit.com/effyteva/ClientLibraries/13a1fc6d4823610a847de814fc72f9eca9401100/Sortable/Sortable.htm

* Dropdown - Similar to Bootstrap's dropdown feature, with some improvements, such as fading menus and RTL support.
See sample at: https://cdn.rawgit.com/effyteva/ClientLibraries/13a1fc6d4823610a847de814fc72f9eca9401100/Dropdown/Dropdown.htm

* SelectBox - Similar to Select2.
This library replaces any INPUT or SELECT form element, and converts into a full dropdown, with support for AJAX queries, results paging, automatic caching, in place editing, and many other features
See sample at: https://cdn.rawgit.com/effyteva/ClientLibraries/13a1fc6d4823610a847de814fc72f9eca9401100/SelectBox/SelectBox.htm

* Storage - Small library for managing storage on the browser, using either Cookies or LocalStorage.

Technically, all libraries are written using TypeScript and LESS, I'm publishing both TS/JS and LESS/CSS versions of all libraries.