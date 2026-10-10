# Tatoeba Lao sentences with English translations

- Source: Tatoeba search API, `https://tatoeba.org/en/api_v0/search?from=lao&to=eng&page=N` (N = 1..20). Only tatoeba.org was fetched.
- Publisher: Tatoeba (tatoeba.org). Sentence license shown by API: CC BY 2.0 FR for every row (attribution required).
- Date read: 2026-10-09.
- Method: each page fetched through WebFetch (an LLM summarizer that re-types the page content), NOT a raw HTTP download. See "Reliability notes": Lao strings are NOT guaranteed character-exact.

## Counts

- Reported by API for from=lao&to=eng: **197** sentences (20 pages, 10 per page, last page has 7). Captured: **197** (pages 1-20, all read; 19x10 + 7).
- The task brief said ~231; the API never reported that. Not reproducible with these queries.
- Adding `&orphans=no&unapproved=no&sort=id` returned the same total (197) and the same first page; the filters appear to be ignored by the API (finder "all", sort null). The HTML `/sentences/search` fallback was not needed because the API did not cap results.
- `from=lao` with no target language: **199** sentences. The 2 extra have no translations at all (found via `from=lao&to=und&trans_filter=exclude&trans_to=eng`, total 2):
  - **No English translation (2): 13108121** `ເຈົ້າໄປໃສມາ` (user xaypanya17), **13108120** `ຫິວເຂົ້າບໍ່` (user xaypanya17). Both have an empty translation list (no translations in any language). Not in the table below.
- Sentences with Thai characters (U+0E00-U+0E7F): **none confirmed**. One apparent Thai letter (U+0E1E "พ") in id 8986512 was a transcription slip in the first fetch; a code-point check confirmed it is Lao U+0E9E. Every other page was reported as all-Lao-block (U+0E80-U+0EFF).
- English-side translation IDs shown are all direct translations unless noted. Some English translation IDs are shared by several Lao sentences (e.g. 8991665, 8978773, 8978770, 8987884, 8999... see rows).

## Table

Columns: tatoeba_id | lao | english (multiple separated by " / ") | english_id(s) | owner / license (license is CC BY 2.0 FR for all rows)

| tatoeba_id | lao | english | english_id(s) | owner / license |
|---|---|---|---|---|
| 8975789 | ຂໍໂທດ. | Excuse me. / Excuse me! | 433504, 2425828 | Analu_Kalaka / CC BY 2.0 FR |
| 1897951 | ຂອບໃຈ! | Thank you! / Thanks! / Thank you. / Ta! | 374827, 448645, 1876041, 8789051 | LanguageExpert / CC BY 2.0 FR |
| 8670346 | ສະບາຍດີ. | Hello. / Hello! | 1858850, 373330 | pastelite / CC BY 2.0 FR |
| 1897933 | ສະບາຍດີ! | Hello! / Hello. / Hallo! / Good afternoon. / Good day! / Good morning. / Hi! / Hey. / Hello / Hi. / Hey! | 373330, 1858850, 10478493, 499689, 855284, 2258234, 2742244, 590217, 14006447, 538123, 7531989 | LanguageExpert / CC BY 2.0 FR |
| 8975744 | ເຈົ້າເດ? | What about you? | 1642551 | Analu_Kalaka / CC BY 2.0 FR |
| 8975752 | ຂອບໃຈຫຼາຍ. | Thank you very much. / Thank you very much! | 1839560, 1564 | Analu_Kalaka / CC BY 2.0 FR |
| 13115622 | ຂ້ອຍຊື່ທອມ | My name is Tom. / My name's Tom. | 1173265, 2649208 | atitarev / CC BY 2.0 FR |
| 8993579 | ລາວຕຸ້ຍໂພດ. | He is too fat. | 8993580 | Analu_Kalaka / CC BY 2.0 FR |
| 8670347 | ຂ້ອຍຢາກກິນ | I want to eat. | 1356939 | pastelite / CC BY 2.0 FR |
| 1897946 | ບໍ່ເຂົ້າໃຈ. | I don't understand. / I don't get it. / I do not understand. / I didn't understand. / I did not understand. / I don't get the point. | 376611, 38392, 376610, 853190, 2083656, 2276009 | LanguageExpert / CC BY 2.0 FR |
| 8993577 | ລາວຕຸ້ຍຫຼາຍ. | He's very fat. / He is very fat. | 8477614, 8993578 | Analu_Kalaka / CC BY 2.0 FR |
| 8975749 | ຂ້ອຍເມົາລົດ. | I'm car sick. | 8975750 | Analu_Kalaka / CC BY 2.0 FR |
| 13108115 | ທອມອອກໄປແລ້ວ | Tom has gone out. | 2272729 | xaypanya17 / CC BY 2.0 FR |
| 8981608 | ໂຮງແຮມນີ້ແພງ. | This hotel is expensive. | 8051050 | Analu_Kalaka / CC BY 2.0 FR |
| 8980198 | ລາວເປັນຊາວນາ. | He's a farmer. / He is a farmer. / He's a farm worker. | 3322848, 3322853, 2568990 | Analu_Kalaka / CC BY 2.0 FR |
| 8975706 | ຂ້ອຍຮັກເຈົ້າ. | I love you. / I love you! / I heart you. | 1434, 2365642, 5140699 | Analu_Kalaka / CC BY 2.0 FR |
| 8991667 | ລາວໄດ້ບໍ່ຕຸ້ຍ. | He isn't fat. / He's not fat. / He is not fat. | 8476250, 8476360, 8991668 | Analu_Kalaka / CC BY 2.0 FR |
| 8975827 | ອາຈານຊື່ຫຍັງ? | What's the teacher's name? | 8975828 | Analu_Kalaka / CC BY 2.0 FR |
| 1897940 | ເຈົ້າຊື່ຫຍັງ? | What's your name? / What is your name? | 408293, 70623 | LanguageExpert / CC BY 2.0 FR |
| 8991673 | ລາວເປັນຄົນຕຸ້ຍ. | He is fat. | 8991674 | Analu_Kalaka / CC BY 2.0 FR |
| 8990244 | ລາວກຳລັງອາບນ້ຳ. | He is taking a shower. | 8990245 | Analu_Kalaka / CC BY 2.0 FR |
| 8983127 | ເມຍລາວໄປຕະຫຼາດ. | His wife goes to the market. | 8983128 | Analu_Kalaka / CC BY 2.0 FR |
| 8975794 | ຂ້ອຍໄປປະເທດລາວ. | I go to Laos. | 8975795 | Analu_Kalaka / CC BY 2.0 FR |
| 8991669 | ລາວຕຸ້ຍນ້ອຍນຶ່ງ. | He is a little fat. | 8991670 | Analu_Kalaka / CC BY 2.0 FR |
| 8990235 | ເຈົ້າລອຍເປັນບໍ? | Can you swim? | 16300 | Analu_Kalaka / CC BY 2.0 FR |
| 8986484 | ລາວອາຍຸເທົ່າໃດ? | How old is he? / What is his age? | 288982, 287285 | Analu_Kalaka / CC BY 2.0 FR |
| 8986481 | ເຈົ້າອາຍຸຈັກປີ? | How old are you? / What is your age? / What's your age? / What age are you? | 436243, 389935, 435255, 6021697 | Analu_Kalaka / CC BY 2.0 FR |
| 8977019 | ອັນນີ້ແມ່ນຫຍັງ? | What is this? / What's this? | 392210, 413821 | Analu_Kalaka / CC BY 2.0 FR |
| 8977016 | ຂ້ອຍໄປຊື້ເຄື່ອງ. | I go shopping. | 8977018 | Analu_Kalaka / CC BY 2.0 FR |
| 8975840 | ເຈົ້າກິນຊີ້ນບໍ? | Do you eat meat? | 427988 | Analu_Kalaka / CC BY 2.0 FR |
| 8975833 | ລາວບໍ່ກິນໝາກໄມ້. | He doesn't eat fruit. | 8975834 | Analu_Kalaka / CC BY 2.0 FR |
| 8975804 | ລາວມາຈາກເມືອງໄທ. | He comes from Thailand. | 8975805 | Analu_Kalaka / CC BY 2.0 FR |
| 8975742 | ເຈົ້າເມື່ອຍບໍ່? | Are you tired? / Do you feel tired? | 317830, 3962696 | Analu_Kalaka / CC BY 2.0 FR |
| 8670349 | ຂ້ອຍຮັກແອບເປີ້ນ | I love apples. | 452809 | pastelite / CC BY 2.0 FR |
| 2427263 | ສະບາຍດີຕອນເຊົ້າ! | Good morning! / Good morning. / Morning! / Hello! / Mornin'! / Good afternoon. / Good day! | 329713, 2258234, 2751743, 373330, 3626661, 499689, 855284 | google / CC BY 2.0 FR |
| 8986482 | ຂ້ອຍອາຍຸຊາວຫ້າປີ. | I'm twenty-five years old. / I am twenty-five years old. | 8986483, 8350346 | Analu_Kalaka / CC BY 2.0 FR |
| 8981604 | ນ້ອງສາວລາວນ້າຮັກ. | His younger sister is cute. | 8981605 | Analu_Kalaka / CC BY 2.0 FR |
| 8980181 | ໝາກຢູ່ນີ້ບໍ່ແຊບ. | This orange isn't delicious. | 8980182 | Analu_Kalaka / CC BY 2.0 FR |
| 8978765 | ລາວບໍ່ແມ່ນຄົນຈີນ. | He is not Chinese. | 8978766 | Analu_Kalaka / CC BY 2.0 FR |
| 8978757 | ຂ້ອຍຢາກຊື້ອັນນີ້. | I want to buy this. | 8833746 | Analu_Kalaka / CC BY 2.0 FR |
| 8977024 | ນີ້ແມ່ນໝາກໄມ້ບໍ? | Is this fruit? | 8977025 | Analu_Kalaka / CC BY 2.0 FR |
| 8975845 | ເຮືອນເຈົ້າຢູ່ໃສ? | Where is your house? / Where's your house? | 370706, 2254684 | Analu_Kalaka / CC BY 2.0 FR |
| 8975747 | ຂ້ອຍຊິອ້ວນແບບນີ້. | I'm going to be fat like this. | 8975748 | Analu_Kalaka / CC BY 2.0 FR |
| 8991671 | ລາວບໍ່ໄດ້ຕຸ້ຍຫຼາຍ. | He is not very fat. / He's not very fat. | 8991672, 8992410 | Analu_Kalaka / CC BY 2.0 FR |
| 8991666 | ລາວບໍ່ຕຸ້ຍຈັກນ້ອຍ. | He is not fat at all. | 8991665 | Analu_Kalaka / CC BY 2.0 FR |
| 8986510 | ລາວມີອາຍຸແຕ່ແປດປີ. | She is still only eight years old. | 8986511 | Analu_Kalaka / CC BY 2.0 FR |
| 8986473 | ຜູ້ນັ້ນແມ່ນແຟນໃຜ? | Whose boyfriend is that? | 8986474 | Analu_Kalaka / CC BY 2.0 FR |
| 8981600 | ຄູບາເຮັດວຽກຢູ່ວັດ. | The monk works at a temple. | 8981601 | Analu_Kalaka / CC BY 2.0 FR |
| 8978761 | ເຈົ້າຢາກກິນອັນໃດ? | Which one do you want to eat? | 8978762 | Analu_Kalaka / CC BY 2.0 FR |
| 8977015 | ດຽວນີ້ເຈົ້າຢູ່ໃສ? | Where are you now? | 679375 | Analu_Kalaka / CC BY 2.0 FR |
| 8975825 | ອາຈານມາຈາກສາລະວັນ. | The teacher comes from Salavan. | 8975826 | Analu_Kalaka / CC BY 2.0 FR |
| 8975785 | ຍິນດີທີ່ໄດ້ຮູ້ຈັກ. | Nice to meet you. / Nice to meet you! | 499617, 2732594 | Analu_Kalaka / CC BY 2.0 FR |
| 14057584 | ຂ້ອຍບໍ່ຢາກໄປໂຮງຮຽນ | I don't want to go to school. / I don't want to go to school! | 1860, 4694896 | ninefi / CC BY 2.0 FR |
| 8986487 | ພໍ່ເຈົ້າອາຍຸຈັກປີ? | How old is your father? | 70960 | Analu_Kalaka / CC BY 2.0 FR |
| 8986485 | ລາວອາຍຸສາມສິບຫ້າປີ. | He is thirty-five years old. | 8986486 | Analu_Kalaka / CC BY 2.0 FR |
| 8977026 | ນີ້ແມ່ນຊື່ເຈົ້າບໍ? | Is this your name? | 8977027 | Analu_Kalaka / CC BY 2.0 FR |
| 8977020 | ອັນນັ້ນແມ່ນໝາກມ່ວງ. | That is a mango. / That's a mango. | 8977021, 9512305 | Analu_Kalaka / CC BY 2.0 FR |
| 8975843 | ມະຫາວິທະຍາໄລຢູ່ໃສ? | Where is the university? | 8975844 | Analu_Kalaka / CC BY 2.0 FR |
| 8975841 | ມື້ນີ້ເຈົ້າຊິໄປໃສ? | Where are you going to go today? | 8975842 | Analu_Kalaka / CC BY 2.0 FR |
| 8975790 | ຂໍໂທດ, ເຈົ້າຊື່ຫຍັງ? | Excuse me, what's your name? | 8975791 | Analu_Kalaka / CC BY 2.0 FR |
| 1897943 | ດີໃຈທີ່ຮູ້ກັບເຈົ້າ. | Nice to meet you. / Nice to know you. / I'm glad to know you. / I am delighted to meet you. / It's nice meeting you. / It's a pleasure to make your acquaintance. / Nice to meet you! | 499617, 3597040, 64648, 71174, 712979, 3722170, 2732594 | LanguageExpert / CC BY 2.0 FR |
| 8987872 | ເຈົ້າກິນທຸລຽນໄດ້ບໍ? | Can you eat durian? | 8987873 | Analu_Kalaka / CC BY 2.0 FR |
| 8980201 | ໝູ່ຂ້ອຍຢັງເປັນທະຫານ. | My friend is still a soldier. | 8980202 | Analu_Kalaka / CC BY 2.0 FR |
| 8975801 | ເຈົ້າຊິມາຍີ່ປຸ່ນບໍ? | Are you going to come to Japan? | 8975802 | Analu_Kalaka / CC BY 2.0 FR |
| 8997046 | ມາລິຈັນໝຸ່ມຫຼືເຖົ້າ? | Is Malichanh young or old? | 8997047 | Analu_Kalaka / CC BY 2.0 FR |
| 8991664 | ລາວບໍ່ໄດ້ຕຸ້ຍຈັກນ້ອຍ. | He is not fat at all. | 8991665 | Analu_Kalaka / CC BY 2.0 FR |
| 8987874 | ເຈົ້າກິນທຸລຽນເປັນບໍ? | Do you know how to eat durian? | 8987875 | Analu_Kalaka / CC BY 2.0 FR |
| 8986501 | ມັນອາຍຸປະມານສິບຫ້າປີ. | It is about fifteen years old. | 8986503 | Analu_Kalaka / CC BY 2.0 FR |
| 8986494 | ໝາໝູ່ເຈົ້າອາຍຸຈັກປີ? | How old is your friend's dog? | 8986495 | Analu_Kalaka / CC BY 2.0 FR |
| 8981602 | ເອື້ອຍຂ້ອຍບໍ່ເຮັດວຽກ. | My older sister doesn't work. | 8981603 | Analu_Kalaka / CC BY 2.0 FR |
| 8981598 | ປູ່ຂ້ອຍບໍ່ແມ່ນຕຳຫຼວດ. | My paternal grandfather wasn't a policeman. | 8981599 | Analu_Kalaka / CC BY 2.0 FR |
| 8980196 | ລາວບໍ່ແມ່ນຜູ້ຊ່ຽວຊານ. | He is not a specialist. | 8980197 | Analu_Kalaka / CC BY 2.0 FR |
| 8978767 | ແມ່ຂ້ອຍບໍ່ມັກກາເຟນີ້. | My mother doesn't like this coffee. | 8978768 | Analu_Kalaka / CC BY 2.0 FR |
| 8978758 | ຂ້ອຍບໍ່ຢາກກິນອັນນັ້ນ. | I don't want to eat that. | 5825243 | Analu_Kalaka / CC BY 2.0 FR |
| 8975797 | ພວກເຮົາໄປຕະຫຼາດນຳກັນ. | We go to the market together. | 8975799 | Analu_Kalaka / CC BY 2.0 FR |
| 8986470 | ນັກກິລາຜູ້ນັ້ນແມ່ນໃຜ? | Who is that athlete? | 8986472 | Analu_Kalaka / CC BY 2.0 FR |
| 8984940 | ລາວບໍ່ເຮັດວຽກຢູ່ໂຮງໝໍ. | He doesn't work in a hospital. | 8984941 | Analu_Kalaka / CC BY 2.0 FR |
| 8983142 | ພວກເຮົາຊິລົມກັນມື້ແລງ. | We talk to each other in the evening. | 8983143 | Analu_Kalaka / CC BY 2.0 FR |
| 8980185 | ອັນນີ້ແມ່ນໝາກໄມ້ຫຍັງ? | What fruit is this? | 8980186 | Analu_Kalaka / CC BY 2.0 FR |
| 8978775 | ນັ້ນບໍ່ແມ່ນໂຮງຮຽນຂ້ອຍ. | That is not my school. | 8978776 | Analu_Kalaka / CC BY 2.0 FR |
| 8978774 | ຜູ້ນັ້ນບໍ່ແມ່ນພໍ່ຂ້ອຍ. | That is not my father. | 8978773 | Analu_Kalaka / CC BY 2.0 FR |
| 8978772 | ຄົນນັ້ນບໍ່ແມ່ນພໍ່ຂ້ອຍ. | That is not my father. | 8978773 | Analu_Kalaka / CC BY 2.0 FR |
| 8978771 | ຜູ້ນີ້ບໍ່ແມ່ນອ້າຍຂ້ອຍ. | This is not my older brother. | 8978770 | Analu_Kalaka / CC BY 2.0 FR |
| 8978769 | ຄົນນີ້ບໍ່ແມ່ນອ້າຍຂ້ອຍ. | This is not my older brother. | 8978770 | Analu_Kalaka / CC BY 2.0 FR |
| 8975807 | ຂ້ອຍຮຽນພາສາລາວທຸກໆມື້. | I study Lao every day. | 8975809 | Analu_Kalaka / CC BY 2.0 FR |
| 14057539 | ຂ້ອຍຈະບໍ່ຊື້ປຶ້ມຫົວນີ້ | I won't buy this book. / I'm not going to buy this book. | 14057595, 14058201 | ninefi / CC BY 2.0 FR |
| 8997049 | ຊານຕາຄລອດສ່ຈ່ອຍຫຼືຕຸ້ຍ? | Is Santa Claus thin or fat? | 8997050 | Analu_Kalaka / CC BY 2.0 FR (FLAG: "ສ່ຈ່ອຍ" looks odd, probably should be ຜອມ/ສ່ຽວ-type word or a fetch error; verify) |
| 8991656 | ທະຫານຕ້ອງລໍຖ້າຕຳຫຼວດມາ. | The soldiers must wait for the police to come. | 8991657 | Analu_Kalaka / CC BY 2.0 FR |
| 8990248 | ລາວກຳລັງເຮັດອາຫານໃຫ້ໝາ. | He is making food for his dogs. | 8990249 | Analu_Kalaka / CC BY 2.0 FR |
| 8990234 | ເຈົ້າຫຼີ້ນເປຍໂນເປັນບໍ? | Can you play the piano? | 34911 | Analu_Kalaka / CC BY 2.0 FR |
| 8986512 | ພວກເຮົາອາຍຸບໍ່ເທົ່າກັນ. | We are not the same age. / We aren't the same age. | 8986513, 8986730 | Analu_Kalaka / CC BY 2.0 FR |
| 8986508 | ບໍ່, ອາຍຸລາວບໍ່ແມ່ນສິບປີ. | No, she isn't ten years old. | 8986509 | Analu_Kalaka / CC BY 2.0 FR |
| 8986496 | ຂ້ອຍຄິດວ່າມັນອາຍຸຫ້າປີ. | I think it is five years old. | 8986497 | Analu_Kalaka / CC BY 2.0 FR |
| 8984942 | ລາວເຮັດວຽກຢູ່ຮ້ານຂາຍຢາ. | He works in a pharmacy. | 8984943 | Analu_Kalaka / CC BY 2.0 FR |
| 8984934 | ຫຼານຊາຍຂ້ອຍແຕ່ງງານແລ້ວ. | My nephew is married. | 8984935 | Analu_Kalaka / CC BY 2.0 FR |
| 8983145 | ພວກເຮົາຈະລົມກັນພາຍຫຼັງ. | We'll talk later. | 1893660 | Analu_Kalaka / CC BY 2.0 FR |
| 8981595 | ລຸງຂ້ອຍເປັນພະນັກງານລັດ. | My father's older brother is a civil servant. | 8981597 | Analu_Kalaka / CC BY 2.0 FR |
| 8975829 | ຂ້ອຍຮຽນພາສາລາວຢູ່ເຮືອນ. | I study Lao at home. | 8975830 | Analu_Kalaka / CC BY 2.0 FR |
| 8986505 | ລູກສາວເຈົ້າອາຍຸສິບປີບໍ? | Is your daughter ten years old? | 8986507 | Analu_Kalaka / CC BY 2.0 FR |
| 8986490 | ແມ່ໝູ່ເຈົ້າອາຍຸເທົ່າໃດ? | How old is your friend's mother? | 8986491 | Analu_Kalaka / CC BY 2.0 FR |
| 8986488 | ລາວອາຍຸປະມານສີ່ສິບຫ້າປີ. | He is about forty-five years old. | 8986489 | Analu_Kalaka / CC BY 2.0 FR |
| 8984932 | ຕຳໝາກຫຸ່ງນີ້ບໍ່ແຊບປານໃດ. | This papaya salad isn't very delicious. | 8984933 | Analu_Kalaka / CC BY 2.0 FR |
| 8984928 | ໝາກໄມ້ນີ້ມາຈາກອົດສະຕາລີ. | This fruit comes from Australia. | 8984929 | Analu_Kalaka / CC BY 2.0 FR |
| 8980189 | ອັນນັ້ນບໍ່ແມ່ນຕຳໝາກຫຸ່ງ. | That is not papaya salad. | 8980190 | Analu_Kalaka / CC BY 2.0 FR |
| 8977022 | ໝາກມ່ວງເຈົ້າແມ່ນໜ່ວຍໃດ? | Which one is your mango? | 8977023 | Analu_Kalaka / CC BY 2.0 FR |
| 8975815 | ມື້ນີ້ນັກຮຽນຮຽນຢູ່ເຮືອນ. | Today the students study at home. | 8975816 | Analu_Kalaka / CC BY 2.0 FR |
| 8995278 | ຄົນຕຸ້ຍຕ້ອງບໍ່ກິນຂອງຫວານ. | The fat man mustn't eat sweets. | 8995279 | Analu_Kalaka / CC BY 2.0 FR |
| 8986514 | ລາວອາຍຸຫຼາຍກວ່າຂ້ອຍສອງປີ. | He is two years older than me. | 8986515 | Analu_Kalaka / CC BY 2.0 FR |
| 8986499 | ອາພາດເມັນເຈົ້າອາຍຸຈັກປີ? | How old is your apartment? | 8986500 | Analu_Kalaka / CC BY 2.0 FR |
| 8983134 | ພໍ່ໝູ່ຂ້ອຍໄປໂຮງຮຽນມື້ນີ້. | My friend's father is going to school today. | 8983135 | Analu_Kalaka / CC BY 2.0 FR |
| 8986492 | ລາວອາຍຸຫ້າສິບຫ້າປີ, ແມ່ນບໍ? | She is fifty-five years old, right? | 8986493 | Analu_Kalaka / CC BY 2.0 FR |
| 8983131 | ພໍ່ເຖົ້າພວກຂ້ອຍບໍ່ມັກກາເຟ. | Our maternal grandfather doesn't like coffee. | 8983133 | Analu_Kalaka / CC BY 2.0 FR |
| 8980191 | ພໍ່ແມ່ຂ້ອຍເປັນຄົນອະເມຣິກາ. | My parents are Americans. | 8980192 | Analu_Kalaka / CC BY 2.0 FR |
| 8977028 | ຂ້ອຍບໍ່ຢາກຊື້ໝາກຖຸລຽນນັ້ນ. | I don't want to buy that durian. | 8977029 | Analu_Kalaka / CC BY 2.0 FR (note spelling ຖຸລຽນ here vs ທຸລຽນ in other durian rows) |
| 8975831 | ລາວຮຽນພາສາອັງກິດຢູ່ໂຮງຮຽນ. | He studies English at school. | 8975832 | Analu_Kalaka / CC BY 2.0 FR |
| 8975813 | ມື້ເຊົ້ານີ້ຂ້ອຍຊິໄປໂຮງຮຽນ. | This morning I am going to go to school. | 8975814 | Analu_Kalaka / CC BY 2.0 FR |
| 8995298 | ເຈົ້າຢາກກິນກາເຟຫຼືນ້ຳຊາບໍ? | Do you want to drink coffee or tea? | 8995299 | Analu_Kalaka / CC BY 2.0 FR |
| 8987869 | ເຈົ້າມາປະເທດລາວປີນີ້ໄດ້ບໍ? | Can you come to Laos this year? | 8987871 | Analu_Kalaka / CC BY 2.0 FR |
| 8983146 | ລາວອອກໄປນາເພາະລາວເປັນຊາວນາ. | He goes out to the rice field because he is a farmer. | 8983148 | Analu_Kalaka / CC BY 2.0 FR |
| 8981606 | ແມ່ຂ້ອຍບໍ່ມັກແມ່ຄ້າຜູ້ນັ້ນ. | My mother doesn't like that sales clerk. | 8981607 | Analu_Kalaka / CC BY 2.0 FR |
| 8980193 | ຂ້ອຍເປັນອາຈານສອນພາສາອັງກິດ. | I am an English teacher. | 2811861 | Analu_Kalaka / CC BY 2.0 FR |
| 8987867 | ຂ້ອຍກັບສຸກສົມບູນອາຍຸເທົ່າກັນ. | Souksomboun and I are the same age. | 8987868 | Analu_Kalaka / CC BY 2.0 FR |
| 8984938 | ລາວຂາຍໝາກໄມ້ທຸກໆມື້ຢູ່ຕະຫຼາດ. | He sells fruit every day at the market. | 8984939 | Analu_Kalaka / CC BY 2.0 FR |
| 8983129 | ຜົວລາວບໍ່ແມ່ນພະນັກງານບໍລິສັດ. | Her husband is not a company employee. | 8983130 | Analu_Kalaka / CC BY 2.0 FR |
| 8975838 | ຂ້ອຍໄປສອນພາສາອັງກິດຢູ່ໂຮງຮຽນ. | I go to teach English at school. | 8975839 | Analu_Kalaka / CC BY 2.0 FR |
| 8975803 | ເຈົ້າຮຽນພາສາອັງກິດທຸກໆມື້ບໍ? | Do you study English every day? | 68921 | Analu_Kalaka / CC BY 2.0 FR |
| 9356681 | ພວກເຮົາ[ZWSP]ຕ້ອງການ[ZWSP]ປະໂຫຍກທີ່ສົມບູນ | We want complete sentences. | 611372 | Balamax / CC BY 2.0 FR (FLAG: contains two U+200B zero-width spaces, shown as [ZWSP]) |
| 8993581 | ເຈົ້າລອຍນ້ຳໜຶ່ງຮ້ອຍແມັດໄດ້ບໍ? | Can you swim one hundred meters? | 8993582 | Analu_Kalaka / CC BY 2.0 FR |
| 8990246 | ຄອບຄົວພວກຂ້ອຍກຳລັງກິນເຂົ້າແລງ. | Our family is eating dinner now. | 8990247 | Analu_Kalaka / CC BY 2.0 FR |
| 8978777 | ລາວບໍ່ແມ່ນອາຈານສອນພາສາລາວຂອງຂ້ອຍ. | He is not my Lao teacher. | 8978778 | Analu_Kalaka / CC BY 2.0 FR |
| 8993595 | ອາຈານຕ້ອງເຂົ້າໃຈນັກສຶກສາຂອງລາວ. | The professor must understand his students. | 8993596 | Analu_Kalaka / CC BY 2.0 FR |
| 8984936 | ລູກຊາຍລາວເປັນນັກສຶກສາຢູ່ນິວຢອກ. | His son is a student in New York. | 8984937 | Analu_Kalaka / CC BY 2.0 FR |
| 8984924 | ແມ່ລາວບໍ່ມັກຊື້ເຄື່ອງຢູ່ຕະຫຼາດ. | Her mother doesn't like shopping at the market. | 8984925 | Analu_Kalaka / CC BY 2.0 FR |
| 8980194 | ຂ້ອຍສອນຢູ່ໂຮງຮຽນມັດທະຍົມຕອນປາຍ. | I teach in a high school. | 8980195 | Analu_Kalaka / CC BY 2.0 FR |
| 8975835 | ຂ້ອຍໄປໂຮງຮຽນເພື່ອສອນພາສາອັງກິດ. | I go to school to teach English. | 8975837 | Analu_Kalaka / CC BY 2.0 FR |
| 8990236 | ເຈົ້າຖ່າຍຮູບຂ້ອຍແລະໝາຂ້ອຍໄດ້ບໍ? | Can you take a photo of me and my dog? | 8990237 | Analu_Kalaka / CC BY 2.0 FR |
| 8987885 | ເຈົ້າເວົ້າພາສາອັງກິດເປັນລ່ຽນບໍ? | Can you speak English fluently? | 8987884 | Analu_Kalaka / CC BY 2.0 FR (shares English id 8987884 with 8987883) |
| 8981590 | ນັກຮຽນຜູ້ນັ້ນບໍ່ແມ່ນນ້ອງຊາຍຂ້ອຍ. | That student is not my younger brother. | 8981592 | Analu_Kalaka / CC BY 2.0 FR |
| 8980183 | ພາສາຫວຽດນາມບໍ່ແມ່ນພາສາງ່າຍປານໃດ. | Vietnamese is not a very easy language. | 8980184 | Analu_Kalaka / CC BY 2.0 FR |
| 8983150 | ນັກຮຽນມາໂຮງຮຽນເພື່ອຮຽນພາສາອັງກິດ. | The students come to school to study English. | 8983151 | Analu_Kalaka / CC BY 2.0 FR |
| 8981593 | ອາສາສະໝັກຜູ້ນັ້ນບໍ່ໄດ້ມາຈາກຝຣັ່ງ. | That volunteer doesn't come from France. | 8981594 | Analu_Kalaka / CC BY 2.0 FR |
| 8995300 | ລູກຊາຍເຈົ້າຢາກເປັນໝໍຫຼືນັກກົດໝາຍ? | Does your son want to become a doctor or a lawyer? | 8995301 | Analu_Kalaka / CC BY 2.0 FR |
| 8983139 | ພວກເຂົາໄປນຳກັນຕະຫຼາດເພື່ອກິນເຂົ້າ. | They go to the market together to eat. | 8983141 | Analu_Kalaka / CC BY 2.0 FR |
| 8977009 | ຂ້ອຍຊິບໍ່ຊື້ໝາກໄມ້ຢູ່ຕະຫຼາດມື້ນີ້. | I'm not going to buy fruit at the market today. | 8977011 | Analu_Kalaka / CC BY 2.0 FR |
| 8990242 | ລາວເປັນຫວັດມື້ນີ້. ລາວກິນເຂົ້າໄດ້ບໍ? | He has a cold today. Can he eat? | 8990243 | Analu_Kalaka / CC BY 2.0 FR |
| 8987883 | ເຈົ້າເວົ້າພາສາອັງກິດໄດ້ລ່ຽນໄຫຼ່ບໍ? | Can you speak English fluently? | 8987884 | Analu_Kalaka / CC BY 2.0 FR (FLAG: "ໄຫຼ່" may be a misspelling of ໄຫຼ; shares English id 8987884 with 8987885) |
| 8987881 | ພວກເຮົາຊື້ຜ້າໄໝຢູ່ຕະຫຼາດນັ້ນໄດ້ບໍ? | Can we buy silk cloth at that market? | 8987882 | Analu_Kalaka / CC BY 2.0 FR |
| 8980187 | ຂ້ອຍຢາກກິນອັນນີ້, ແຕ່ຂ້ອຍຊິບໍ່ຊື້ມັນ. | I want to eat this but I won't buy it. | 8980188 | Analu_Kalaka / CC BY 2.0 FR |
| 8977004 | ມື້ນີ້ຂ້ອຍຊິບໍ່ຊື້ໝາກໄມ້ຢູ່ຕະຫຼາດ. | Today I'm not going to buy fruit at the market. | 8977007 | Analu_Kalaka / CC BY 2.0 FR |
| 8993591 | ຂ້ອຍຕ້ອງມາຮອດເຮືອນກ່ອນເຈັດໂມງຄືນນີ້. | I have to arrive home before 19:00 tonight. | 8993592 | Analu_Kalaka / CC BY 2.0 FR |
| 8983125 | ຂ້ອຍຊື້ປຶ້ມຫົວນີ້ຢູ່ຮ້ານຂາຍປຶ້ມນັ້ນ. | I bought this book at that bookstore. | 8983126 | Analu_Kalaka / CC BY 2.0 FR |
| 8995283 | ນັກຮຽນສະຫຼາດຜູ້ນັ້ນບໍ່ຕ້ອງການຮຽນຫຼາຍ. | That intelligent student doesn't need to study much. | 8995284 | Analu_Kalaka / CC BY 2.0 FR |
| 8993584 | ເຈົ້າແຕ່ງອາຫານລາວຄືກັບແມ່ເຈົ້າໄດ້ບໍ? | Can you cook Lao food like your mother? | 8993586 | Analu_Kalaka / CC BY 2.0 FR |
| 8997036 | ຂ້ອຍຢາກຢູ່ໃນແຂວງສາລະວັນຫຼືແຂວງຈຳປາສັກ. | I want to live in Salavan Province or Champasak Province. | 8997037 | Analu_Kalaka / CC BY 2.0 FR |
| 8995295 | ກະລຸນາອ່ານຈາກໜ້າ 50 ເຖິງໜ້າ 100 ໃນປຶ້ມຫົວນີ້. | Please read from page 50 to page 100 in this book. | 8995297 | Analu_Kalaka / CC BY 2.0 FR (ASCII digits in Lao text) |
| 8990251 | ລໍຖ້າ. ຂ້ອຍກຳລັງພິມຂໍ້ຄວາມຫາເຈົ້າດຽວນີ້. | Wait. I am writing you a message now. | 8990252 | Analu_Kalaka / CC BY 2.0 FR |
| 8984944 | ຂ້ອຍຊື້ໝາກໄມ້ກັບຜັກຢູ່ຕະຫຼາດມື້ວານນີ້. | I bought fruit and vegetables at the market yesterday. | 8984945 | Analu_Kalaka / CC BY 2.0 FR |
| 8997033 | ເຈົ້າຢາກເດີນທາງໄປລອນດອນ, ປາຣີສຫຼືນິວຢອກ? | Do you want to travel to London, Paris or New York? | 8997034 | Analu_Kalaka / CC BY 2.0 FR |
| 8991654 | ຂ້ອຍຟັງເພງຢູ່ໃນຫ້ອງຕອນທີ່ຂ້ອຍຖ້າເຈົ້າ. | I am listening to music in my room while I wait for you. | 8991655 | Analu_Kalaka / CC BY 2.0 FR |
| 8981588 | ລາວເປັນນັກການເມືອງດີແຕ່ລາວບໍ່ແມ່ນຜົວດີ. | He is a good politician but he isn't a good husband. | 8981589 | Analu_Kalaka / CC BY 2.0 FR |
| 8977012 | ຂ້ອຍກິນເຂົ້າຢູ່ເຮືອນແລ້ວຂ້ອຍຮຽນພາສາລາວ. | I eat at home then I study Lao. | 8977013 | Analu_Kalaka / CC BY 2.0 FR |
| 8997054 | ເຈົ້າມັກລະຄອນໄທຫຼືລະຄອນເກົາຫຼີຫຼາຍກວ່າ? | Do you prefer Thai dramas or Korean dramas? | 8997055 | Analu_Kalaka / CC BY 2.0 FR |
| 8997052 | ເຈົ້າຈື່ຂຶ້ນໃຈຄໍາສັບໃໝ່ທັງໝົດແລ້ວຫຼືບໍ? | Did you memorize by heart all the new words or not? | 8997053 | Analu_Kalaka / CC BY 2.0 FR (uses U+0ECD+U+0EB2 "ຄໍາ" rather than precomposed U+0EB3) |
| 8993598 | ຂ້ອຍລືມຄັນຮົ່ມຂ້ອຍຢູ່ໂຮງຮຽນຕອນສວຍມື້ນີ້. | I forgot my umbrella at school this afternoon. | 8993599 | Analu_Kalaka / CC BY 2.0 FR |
| 8990238 | ຂ້ອຍຢາກຊື້ສິ້ນນີ້. ເຈົ້າຫຼຸດໃຫ້ຂ້ອຍໄດ້ບໍ? | I want to buy this sinh. Can you give me a discount? | 8990239 | Analu_Kalaka / CC BY 2.0 FR |
| 8983137 | ພວກເຮົາຈະບໍ່ຮຽນພາສາອັງກິດນຳກັນມື້ແລງນີ້. | We will not study English together this evening. | 8983138 | Analu_Kalaka / CC BY 2.0 FR |
| 8993587 | ຄົນຂີ້ຄ້ານຜູ້ນັ້ນຕ້ອງເຮັດວຽກໜັກກວ່າເກົ່າ. | That lazy man must work harder. | 8993589 | Analu_Kalaka / CC BY 2.0 FR |
| 8980199 | ພວກເຂົາເປັນນັກສຶກສາມະຫາວິທະຍາໄລຢູ່ວຽງຈັນ. | They are university students in Vientiane. | 8980200 | Analu_Kalaka / CC BY 2.0 FR |
| 8978763 | ໜ່ວຍນີ້ບໍ່ແມ່ນໝາກແອັບເປິ້ນ. ມັນແມ່ນໝາກກ້ຽງ. | This is not an apple. It is an orange. | 8978764 | Analu_Kalaka / CC BY 2.0 FR |
| 8995293 | ຍ່າງຈາກເຮືອນເຈົ້າໄປໂຮງຮຽນໃຊ້ເວລາດົນປານໃດ? | How long does it take to walk from your house to school? | 8995294 | Analu_Kalaka / CC BY 2.0 FR |
| 8984926 | ຂ້ອຍບໍ່ກິນເຂົ້າຢູ່ຮ້ານອາຫານນັ້ນເພາະມັນແພງ. | I don't eat at that restaurant because it's expensive. | 8984927 | Analu_Kalaka / CC BY 2.0 FR |
| 8997043 | ເຈົ້າຢາກຈະໃຊ້ປຶ້ມແບບຮຽນຫົວນີ້ຫຼືຫົວນັ້ນບໍ? | Do you want to use this textbook or that one? | 8997045 | Analu_Kalaka / CC BY 2.0 FR |
| 8995291 | ມື້ວານຂ້ອຍນອນແຕ່ 12:00 ໂມງກາງຄືນຮອດ 5:30 ໂມງເຊົ້ານີ້. | Yesterday I slept from 12:00 midnight to 5:30 this morning. | 8995292 | Analu_Kalaka / CC BY 2.0 FR (ASCII digits) |
| 8991658 | ຂ້ອຍບໍ່ມັກເບິ່ງໂທລະທັດ.ຂ້ອຍມັກຟັງເພັງຫຼາຍກວ່າ. | I don't like watching television. I prefer listening to music. | 8991659 | Analu_Kalaka / CC BY 2.0 FR (no space after the period in the Lao) |
| 8990240 | ເຈົ້ານັບຈາກໜຶ່ງເຖິງໜຶ່ງຮ້ອຍເປັນພາສາລາວໄດ້ບໍ? | Can you count from one to one hundred in Lao? | 8990241 | Analu_Kalaka / CC BY 2.0 FR |
| 8995285 | ເລຂາຕ້ອງຂຽນອີເມວຫຼາຍມື້ເຊົ້ານີ້ກ່ອນສິບເອັດໂມງ. | The secretary must write many emails this morning before 11:00. | 8995286 | Analu_Kalaka / CC BY 2.0 FR |
| 8997041 | ເຈົ້າຈະຕັດຜົມຕອນເຊົ້າວັນເສົາຫຼືຕອນສວຍວັນອາທິດ? | Will you get a haircut on Saturday morning or Sunday afternoon? | 8997042 | Analu_Kalaka / CC BY 2.0 FR |
| 8987887 | ພວກເຮົາຕຳໝາກຫຸ່ງນີ້ໄດ້ບໍຫຼືມັນວ່າສຸກໂພດແລ້ວ? | Can we make papaya salad with this papaya or is it too ripe? | 8987888 | Analu_Kalaka / CC BY 2.0 FR |
| 8995281 | ໂຮງໜັງຢູ່ໄກຈາກເຮືອນຂ້ອຍຫຼາຍ, ແຕ່ຫ້ອງການຕຳຫຼວດຢູ່ໃກ້. | The movie theater is very far from my house but the police station is close. | 8995282 | Analu_Kalaka / CC BY 2.0 FR |
| 8997038 | ກະລຸນາຂຽນຊື່ເຈົ້າດ້ວຍໝຶກດຳຫຼືໝຶກຟ້າແຕ່ບໍ່ແມ່ນໝຶກແດງ. | Please write your name in black or blue ink but not in red ink. | 8997039 | Analu_Kalaka / CC BY 2.0 FR |
| 8987889 | ເຈົ້າໄປຕະຫຼາດແລະຊື້ໝາກເດັ່ນມາສິບໜ່ວຍໄດ້ບໍກ່ອນເຂົ້າແລງ? | Can you go to the market and buy ten tomatoes before dinner? | 8987891 | Analu_Kalaka / CC BY 2.0 FR |
| 8991660 | ຂ້ອຍກຳລັງຮຽນພາສາລາວຕອນນີ້. ຂ້ອຍຈະສົ່ງຂໍ້ຄວາມຫາເຈົ້າພາຍຫຼັງ. | I am studying Lao now. I will send you a message later. | 8991661 | Analu_Kalaka / CC BY 2.0 FR |
| 8987894 | ໂຮງແຮມນັ້ນລາຄາຖືກແລະເປື້ອນຫຼາຍ. ເຈົ້າສາມາດນອນຢູ່ຫັນໄດ້ແທ້ບໍ? | That hotel is very cheap and dirty. Can you really sleep there? | 8987896 | Analu_Kalaka / CC BY 2.0 FR |
| 8987876 | ເຈົ້າຮຽນພາສາອັງກິດນຳກັນກັບຂ້ອຍໃນຕອນແລງວັນຈັນໜ້າເວລາ 20:00 ໄດ້ບໍ? | Can you study English together with me next Monday night at 20:00? | 8987877 | Analu_Kalaka / CC BY 2.0 FR |
| 8993593 | ຈັກໜ້ອຍຂ້ອຍຊິໄປຊື້ເຄື່ອງຢູ່ຮ້ານສັບພະສິນຄ້າເພື່ອຊື້ຊີ້ນກັບຜັກ. | In a little while I am going shopping at the supermarket in order to buy meat and vegetables. | 8993594 | Analu_Kalaka / CC BY 2.0 FR |
| 8991662 | ເຈົ້າສອນພາສາລາວຫາຂ້ອຍໃນຕອນແລງວັນພຸດໜ້າເວລາ 20:00 ເວລາປະເທດລາວໄດ້ບໍ? | Can you teach me Lao next Wednesday night at 20:00 Laos time? | 8991663 | Analu_Kalaka / CC BY 2.0 FR |
| 8987879 | ເຈົ້າຮຽນພາສາລາວນຳກັນກັບຂ້ອຍໃນຕອນແລງຂອງວັນທີ16 ກໍລະກົດ ເວລາ 20:00 ໄດ້ບໍ? | Can you study Lao together with me in the evening of July 16 at 20:00? | 8987880 | Analu_Kalaka / CC BY 2.0 FR |
| 8993601 | ນັກຮຽນຂີ້ຄ້ານຜູ້ນັ້ນຕ້ອງຮຽນຍ່າງດຸໝັ່ນເພື່ອຈະເຂົ້າຮຽນມະຫາວິທະຍາໄລ. | That lazy student must study diligently in order to enter the university. | 8993602 | Analu_Kalaka / CC BY 2.0 FR |
| 8995288 | ຂ້ອຍຫຍຸ້ງຫຼາຍມື້ນີ້. ເຈົ້າໄປຫ້ອງການໄປສະນີແລະສົ່ງຈົດໝາຍນີ້ໃຫ້ຂ້ອຍໄດ້ບໍ? | I'm very busy today. Can you go to the post office and send these letters for me? | 8995290 | Analu_Kalaka / CC BY 2.0 FR |
| 8997058 | ຂ້ອຍຈະສົ່ງຂໍ້ຄວາມຫາເຈົ້າຄືນນີ້ກ່ອນຂ້ອຍເຂົ້ານອນຫຼືມື້ອື່ນເຊົ້າຫຼັງຈາກຂ້ອຍຕື່ນ. | I will send you a message tonight before I go to bed or tomorrow morning after I get up. | 8997059 | Analu_Kalaka / CC BY 2.0 FR |
| 8984930 | ລາວຈະນອນຢູ່ໂຮງແຮມຢູ່ປາກເຊຄືນມຶ້ນີ້ແຕ່ລາວຈະນອນຢູ່ເຮືອນພັກຢູ່ຫຼວງພະບາງຄືນມື້ອື່ນ. | He will sleep at a hotel in Pakse tonight but he will sleep in a guest house in Luang Prabang tomorrow night. | (id not captured) | Analu_Kalaka / CC BY 2.0 FR (FLAG: "ມຶ້ນີ້" is likely a typo/transcription error for ມື້ນີ້) |
| 12394134 | ຜູ້ຊະນະເລີດຈະໄດ້ຮັບລາງວັນກັບບ້ານ 7,500 ໂດລາສຳລັບໂຄງການວິທະຍາສາດໂຮງຮຽນຂອງເຂົາເຈົ້າ ແລະ ຈະໄດ້ເດີນທາງໄປຮ່ວມທັດສະນະລະດູຮ້ອນທີ່ເພັ່ງເລັງໃສ່ວິທະຍາສາດ. | The winners take home $7,500 for their school's science program and get a trip to a science-focused summer camp. | (id not captured) | Cangarejo / CC BY 2.0 FR (FLAG: real text contains ZWSP between words; ZWSPs omitted here; transcribed by hand from escapes; LOW CONFIDENCE) |
| 2699763 | ມະນຸດທຸກຄົນເກີດມາມີກຽດສັກສີ, ສິດທິ, ເສຣີພາບແລະຄວາມສະເໝີພາບເທົ່າທຽມກັນ. ທຸກໆຄົນມີເຫດຜົນແລະຄວາມຄິດຄວາມເຫັນສ່ວນຕົວຂອງໃຜຂອງມັນ, ແຕ່ວ່າມະນຸດທຸກໆຄົນຄວນປະພຶດຕໍ່ກັນຄືກັບເປັນອ້າຍນ້ອງກັນ. | All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood. | (id not captured; this English text appeared as an alternate/indirect translation) | Anthaus / CC BY 2.0 FR (FLAG: Lao text is a UDHR Art. 1 rendering that does not appear to mirror the English closely; LOW CONFIDENCE in exact characters) |
| 12231800 | ພາບວີດີໂອທີ່ເຜີຍແຜ່ສື່ສັງຄົມໄດ້ສະແດງໃຫ້ເຫັນຄົນປີນອອກຈາກປ່ອງຢ້ຽມດ້ວຍເຊືອກທີ່ເຮັດດ້ວຍຜ້າປູບ່ອນນອນຜູກຕໍ່ກັນ ໃນຂະນະທີ່ຄົນອື່ນໆໄດ້ເຫັນນັ່ງຢູ່ເທິງເຄື່ອງປັບອາກາດທີ່ຕິດຕັ້ງຢູ່ນອກປ່ອງຢ້ຽມ. | A video posted on social media showed people climbing out of windows on ropes made of bedsheets tied together, while others were seen sitting on air conditioning units installed outside the windows. | (id not captured) | Cangarejo / CC BY 2.0 FR (LOW CONFIDENCE exact characters; ZWSP present in source) |
| 12220040 | ເຈວດັ່ງກ່າວຖືກສີດເປັນຂອງແຫຼວ. ຢູ່ໃນສະໝອງ, ມັນຈະປ່ຽນເປັນສານຄ້າຍວຸ້ນ ແລະ ສາມາດສີດໃສ່ບໍລິເວນທີ່ຖືກທຳລາຍໂດຍພາກິນສັນ ຫຼື ອຳພະຍາດ. ຈາກນັ້ນເຊວຕົ້ນກຳເນີດສາມາດຖືກສັ່ງໃຫ້ສ້າງເຊວປະສາດທົດແທນ. | The gel is injected as a liquid. In the brain, it reverts to a jelly-like substance and can be administered to specific areas impaired by Parkinson's or a stroke. The stem cells can then be instructed to create replacement neurons. | (id not captured) | Cangarejo / CC BY 2.0 FR (LOW CONFIDENCE; an earlier fetch gave the first word as ເຈລ, the later one as ເຈວ; "ພາກິນສັນ ຫຼື ອຳພະຍາດ" looks suspicious vs English "Parkinson's or a stroke") |
| 12225952 | ເມື່ອເບິ່ງຜ່ານໆ ການຂຽນນີ້ອາດເບິ່ງຄືວ່າບໍ່ມີຫຍັງພິເສດ, ແຕ່ທັງໝົດນີ້ຖືກຂຽນດ້ວຍຄວາມຄິດລ້ວນໆ. ໃນຂະນະທີ່ຜູ້ເຂົ້າຮ່ວມຈິນຕະນາການຂຽນຕົວອັກສອນຫຼືສັນຍາລັກ ເຊັນເຊີທີ່ຝັງໄວ້ໃນສະໝອງຂອງລາວ ຈັບຮູບແບບກິດຈະກຳໄຟຟ້າ, ເຊິ່ງຈາກນັ້ນອັລກໍຣິດທຶມຕີຄວາມເພື່ອຕິດຕາມເສັ້ນທາງຂອງປາກກາຈິນຕະນາການ. | At first glance, this writing may seem unremarkable, but it was written entirely through thought. As the participant imagined writing a letter or symbol, sensors implanted in his brain picked up on patterns of electrical activity, which an algorithm then interpreted to trace the path of an imaginary pen. | (id not captured) | Cangarejo / CC BY 2.0 FR (LOW CONFIDENCE exact characters; ZWSP present in source) |
| 12218306 | ໃນມື້ນີ້ ທ່ານທູດສະຫະລັດ ດຣ. ປີເຕີ ເອັມ. ເຮມອນ ໄດ້ມອບຖັງບັນຈຸຂ້າວເສີມວິຕາມິນ, ຖົ່ວເລນທິວ, ປາກະປ໋ອງ ແລະ ນ້ຳມັນປຸງອາຫານເສີມວິຕາມິນ ໃຫ້ແກ່ຮອງລັດຖະມົນຕີສຶກສາທິການແລະກິລາ ດຣ. ສີສຸກ ວົງວິຈິດ ທີ່ສາງອາຫານໂລກ (WFP) ໃນນະຄອນຫຼວງວຽງຈັນ. ອາຫານນີ້ຈະຖືກນຳໃຊ້ເພື່ອເຮັດອາຫານກາງວັນທີ່ມີປະໂຫຍດໃຫ້ນັກຮຽນຈຳນວນ 63,000 ຄົນທົ່ວ ສປປ ລາວ. | U.S. Ambassador Dr. Peter M. Haymond handed over 93 containers of fortified rice, lentils, canned fish and fortified cooking oil to Deputy Minister of Education and Sports, Dr. Sisouk Vongvichith at the World Food Programme's (WFP) warehouse in Vientiane today. The food will be used to prepare healthy school lunches for 63,000 school children around Lao PDR. | (id not captured) | Cangarejo / CC BY 2.0 FR (LOW CONFIDENCE exact characters; "ຂ້າວ" for ເຂົ້າ looks like a typo) |

Row count check: 197 rows above (pages 1-20).

## Sentences by length/quality note
- Pages 1-16: short learner sentences, mostly user Analu_Kalaka (a systematic Lao course set); good candidates for beginner curriculum.
- Pages 17-19: longer, multi-clause sentences (same author).
- Last 7 entries (page 20): one more Analu_Kalaka sentence plus 6 long news/UDHR-style sentences (Cangarejo, Anthaus) - too advanced for a beginner curriculum and the least reliably transcribed.
- Several Analu_Kalaka sentences are repetitive variants (ຕຸ້ຍ "fat" x8+, age/ອາຍຸ pattern, market/ຊິບໍ່ຊື້).

## Open questions / gaps
- English translation ID missing for 8984930, 12394134, 12231800, 12220040, 12225952, 12218306 (page 20 fetch gave only IDs of Lao sentences); 2699763's English is only an alternate/indirect link.
- The brief's "about 231" could not be reconciled with 197 (with English) / 199 (any translation). Possibly a count including other filters, unapproved, or a stale number.
- Audio presence was seen on some sentences (not recorded in the table; English-side audio by CK etc.).
- Per-translation license/owner of English sentences was not shown by the API.
- The Lao sentences' linguistic correctness (dialect, spelling) was not verified; many are by a single learner/teacher.
- Whether sentences have Tatoeba "correctness" flags was not captured (all displayed 0 where reported).

## Reliability notes
- CRITICAL: WebFetch passes the API JSON through a small LLM that decodes `\uXXXX` and re-types Lao. Re-fetches of the same sentence returned different strings: 13115622 `ຂ້ອຍຊື່ທອມ` vs `ຂ້ອຍຊື່ໂທມ`; 8993579 `ລາວຕຸ້ຍໂພດ.` vs `ລາວຕຸ້ນໂພດ.`; 1897951 `ຂອບໃຈ!` vs `ຂໍອບໃຈ!`; 8670346 `ສະບາຍດີ.` vs `ສະບາຍດີ` (trailing period). The table uses the most consistent/primary-pass version, but treat ALL Lao text as unverified against byte-exact source. Final verification should use a raw download (e.g., curl/Python outside this tool) or `https://tatoeba.org/en/sentences/show/<id>`.
- Page 17 (and 20) were first returned as raw `\u` escapes; they were later decoded by the tool along with code points, which matched the escapes; page 17 rows are therefore the most reliable of the set.
- The Lao strings for the last 6 rows were assembled from chunked, hand-decoded output (the summarizer refused to give them whole); ZWSP characters are inconsistently reported. Treat them as unreliable.
- The API's own paging field showed "current: 10" on many pages (a perPage-like quirk) but "page"/"requestedPage" matched what was requested; start/end ranges were contiguous (1-197), so no page was missed or duplicated by the tool.
- No instructions embedded in fetched content were encountered.
- Possible content errors originate in the source data (e.g., 8984930 "ມຶ້ນີ້", 12218306 "ຂ້າວ", 8997049 "ສ່ຈ່ອຍ") rather than the tool; cannot distinguish without raw data.
