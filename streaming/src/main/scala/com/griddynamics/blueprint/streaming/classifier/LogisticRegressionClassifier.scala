/**
 * Copyright © 2016 Grid Dynamics (info@griddynamics.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.griddynamics.blueprint.streaming.classifier

import com.google.common.annotations.VisibleForTesting
import com.griddynamics.blueprint.streaming.ClassificationModel
import com.griddynamics.blueprint.streaming.domain.TweetAndMovie
import org.tartarus.snowball.ext.englishStemmer

import scala.Array._

class LogisticRegressionClassifier(model: ClassificationModel) extends Classifier {
  val rootExceptions = Array(":(", ":)", ":-)", ":D", ";)", "^_^", "^__^", "^___^", "can't stand", "cant stand",
    "cool stuff", "does not work", "dont like", "don't like", "fed up", "green wash", "no fun", "not working",
    "right direction", "some kind")

  override def classify(tweetAndMovie: TweetAndMovie): Boolean = {
    val words = parseWords(tweetAndMovie.tweet.message, tweetAndMovie.movie)
    val probability = applyLogisticFunction(words)
    makeDecision(probability)
  }

  def makeDecision(probability: Double): Boolean = {
    probability < model.threshold
  }

  @VisibleForTesting
  private[classifier] def applyLogisticFunction(words: Seq[String]): Double = {
    val intermediateValue = words.flatMap(model.getWordCoefficient).foldLeft(model.intercept)(_ + _)
    math.exp(intermediateValue) / (1 + math.exp(intermediateValue))
  }

  @VisibleForTesting
  private[classifier] def parseWords(text: String, movie: String): Seq[String] = {
    // STEP 1. Everything to lower case
    // '"Star Wars" is great, but boring ^_^' -> '"star wars" is great, but very very boring ^_^'
    val lowercaseText = text.toLowerCase
    val lowercaseMovie = movie.toLowerCase

    // STEP 2. PARSE OUT EMOTIONS AND EXCEPTIONAL N-GRAMS
    // '"star wars" is great, but boring ^_^' -> '"star wars" is great, but very very boring '
    val (exceptions, noExceptionsText) = cutExceptions(lowercaseText, rootExceptions)

    // STEP 3. REMOVE PUNCTUATION
    // '"star wars" is great, but boring ' -> 'star wars is great but very very boring '
    val noPunctuationText = removePunctuation(noExceptionsText)
    val noPunctuationMovie = removePunctuation(lowercaseMovie)


    // STEP 5. REMOVE MOVIE NAME FROM TEXT
    // 'star wars is great but boring ' -> ' is great but very very boring '
    val textWithNoMovie = noPunctuationText.replaceAll(noPunctuationMovie, "")

    // STEP 6. SPLIT THE TEXT TO WORDS
    // ' is great but boring ' -> ['is', 'great', 'but', 'very', 'very', 'boring']
    val nonStemmedWords = textWithNoMovie.split("\\s").filter(_.length() > 0)

    // STEP 7. STEM THE WORDS
    // ['is', 'great', 'but', 'boring'] -> ['is', 'great', 'but', 'veri', 'veri', 'bore']
    val stemmedWords = nonStemmedWords.map(stemWord)

    // STEP 8. REMOVE DUPLICATED WORDS
    // ['is', 'great', 'but', 'veri', 'veri', 'bore'] -> ['is', 'great', 'but', 'veri', 'bore']
    val deduplicatedWords = removeDuplicates(stemmedWords)

    // STEP 8. JOIN RESULTS WITH THE EXCEPTIONS AND RETURN
    // ['is', 'great', 'but', 'veri', 'bore'], ['^_^'] -> ['is', 'great', 'but', 'veri', 'bore', '^_^']
    deduplicatedWords.toList ++ exceptions
  }

  @VisibleForTesting
  private[classifier] def cutExceptions(text: String, exceptions: Seq[String]): (Seq[String], String) = {
    val parsed = scala.collection.mutable.MutableList[String]()
    var cleanedText = text
    for (exception <- exceptions) {
      var idx = 0
      do {
        idx = cleanedText.indexOf(exception)
        if (idx != -1) {
          parsed += exception
          // cut out the exception from the text
          cleanedText = cleanedText.take(idx) + cleanedText.takeRight(cleanedText.length - exception.length - idx)
        }
      } while (idx != -1)
    }
    (parsed, cleanedText)
  }

  /**
   * Removes all non-letter characters and merges spaces, newlines, tabulations
   */
  @VisibleForTesting
  private[classifier] def removePunctuation(text: String): String = {
    // http://stackoverflow.com/questions/18830813/how-can-i-remove-punctuation-from-input-text-in-java
    text.replaceAll("[^\\p{L} ]", " ").replaceAll("[\\s\\t\\n\\r]+", " ")
  }

  @VisibleForTesting
  private[classifier] def stemWord(input: String): String = {
    val stemmer = new englishStemmer
    stemmer.setCurrent(input)
    stemmer.stem()
    stemmer.getCurrent
  }

  @VisibleForTesting
  private[classifier] def removeDuplicates(input: Seq[String]): Set[String] = {
    input.toSet
  }
}
